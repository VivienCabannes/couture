"""Integration tests for the FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestRoot:
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Couture API"

    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestShopEndpoints:
    def test_list_garments(self):
        response = client.get("/api/shop/garments")
        assert response.status_code == 200
        garments = response.json()
        assert len(garments) >= 1
        names = [g["name"] for g in garments]
        assert "top" in names
        # Check pieces
        top = next(g for g in garments if g["name"] == "top")
        assert len(top["pieces"]) == 2
        piece_types = [p["pattern_type"] for p in top["pieces"]]
        assert "corset" in piece_types
        assert "sleeve" in piece_types


class TestMeasurementEndpoints:
    def test_list_sizes(self):
        response = client.get("/api/measurements/sizes")
        assert response.status_code == 200
        sizes = response.json()
        assert 38 in sizes
        assert len(sizes) == 8

    def test_get_default_measurements(self):
        response = client.get("/api/measurements/defaults/38")
        assert response.status_code == 200
        data = response.json()
        assert data["full_bust"] == 88.0
        assert data["full_waist"] == 68.0

    def test_get_default_measurements_size_40(self):
        response = client.get("/api/measurements/defaults/40")
        assert response.status_code == 200
        data = response.json()
        assert data["full_bust"] == 92.0

    def test_invalid_size(self):
        response = client.get("/api/measurements/defaults/37")
        assert response.status_code == 404


class TestPresetEndpoints:
    def test_list_presets(self):
        response = client.get("/api/measurements/presets")
        assert response.status_code == 200
        presets = response.json()
        assert "kwama" in presets
        assert "vivien" in presets
        assert len(presets) == 2

    def test_get_preset_vivien(self):
        response = client.get("/api/measurements/presets/vivien")
        assert response.status_code == 200
        data = response.json()
        assert data["full_bust"] == 102.0
        assert data["full_waist"] == 83.0
        assert data["waist_to_floor"] == 126.0

    def test_get_preset_kwama(self):
        response = client.get("/api/measurements/presets/kwama")
        assert response.status_code == 200
        data = response.json()
        assert data["full_bust"] == 90.0
        assert data["full_hip"] == 100.0

    def test_get_preset_unknown(self):
        response = client.get("/api/measurements/presets/unknown")
        assert response.status_code == 404


class TestPatternEndpoints:
    def test_list_pattern_types(self):
        response = client.get("/api/modelist/patterns")
        assert response.status_code == 200
        types = response.json()
        assert len(types) == 2
        names = [t["name"] for t in types]
        assert "corset" in names
        assert "sleeve" in names

    def test_generate_corset_all(self):
        m_response = client.get("/api/measurements/defaults/38")
        measurements = m_response.json()

        response = client.post("/api/modelist/generate", json={
            "pattern_type": "corset",
            "measurements": measurements,
            "output_format": "all",
        })
        assert response.status_code == 200
        data = response.json()
        assert "<svg" in data["construction_svg"]
        assert "<svg" in data["pattern_svg"]
        assert isinstance(data["warnings"], list)

    def test_generate_corset_svg(self):
        m_response = client.get("/api/measurements/defaults/38")
        measurements = m_response.json()

        response = client.post("/api/modelist/generate", json={
            "pattern_type": "corset",
            "measurements": measurements,
            "output_format": "svg",
        })
        assert response.status_code == 200
        assert "image/svg+xml" in response.headers["content-type"]
        assert "<svg" in response.text

    def test_generate_corset_pdf(self):
        m_response = client.get("/api/measurements/defaults/38")
        measurements = m_response.json()

        response = client.post("/api/modelist/generate", json={
            "pattern_type": "corset",
            "measurements": measurements,
            "output_format": "pdf",
        })
        assert response.status_code == 200
        assert "application/pdf" in response.headers["content-type"]
        assert response.content[:5] == b"%PDF-"

    def test_generate_corset_with_stretch(self):
        m_response = client.get("/api/measurements/defaults/38")
        measurements = m_response.json()

        response = client.post("/api/modelist/generate", json={
            "pattern_type": "corset",
            "measurements": measurements,
            "stretch": {"horizontal": 0.2, "vertical": 0.1, "usage": 1.0},
            "output_format": "all",
        })
        assert response.status_code == 200
        data = response.json()
        assert "<svg" in data["construction_svg"]

    def test_generate_corset_with_control_parameters(self):
        m_response = client.get("/api/measurements/defaults/38")
        measurements = m_response.json()

        response = client.post("/api/modelist/generate", json={
            "pattern_type": "corset",
            "measurements": measurements,
            "control_parameters": {"front_neck_center": 0.7},
            "output_format": "all",
        })
        assert response.status_code == 200

    def test_generate_sleeve(self):
        response = client.post("/api/modelist/generate", json={
            "pattern_type": "sleeve",
            "measurements": {
                "armhole_depth": 19.5,
                "armhole_measurement": 45,
                "sleeve_length": 66.0,
                "upper_arm_to_elbow": 35.0,
                "sleeve_bottom_width": 20.0,
            },
            "output_format": "all",
        })
        assert response.status_code == 200
        data = response.json()
        assert "<svg" in data["construction_svg"]
        assert "<svg" in data["pattern_svg"]

    def test_generate_invalid_measurements(self):
        response = client.post("/api/modelist/generate", json={
            "pattern_type": "corset",
            "measurements": {"full_bust": 88.0},
            "output_format": "all",
        })
        assert response.status_code == 422
