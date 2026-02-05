## Code Review

I have some constraint, I want to make sure that all my Bezier curves never crosses the Starting point - Control point line, can you make a test to make sure that none of these happen. If so can you raise a warning.

Review the bezier point construction, extract utilities functions such as contrains to pass by some points.

Review the code to ensure it is clean enough.

Can you make sure the the sleeve_pattern follows roughly the same structure as the corset_pattern (ControlParameters, build_construction_points, build_bezier_helper_points, _plot_reference, _plot_printable, ...)?

## Better construction of the curves

Control parameters for the curves A1 to B1 and B1 to C1.

Option to aisance aux differents endroits.

## Rendering
Add waist, bust and shoulder level.

Clean the code, maybe extract a generic ConstructionRendering and PatternRendering.

#### Better rendering of the Construction plot

Clean coordinates rendering

#### Better rendering of the Pattern plot

Option to print over several A4 stuffs with margin to help reassemble.

---

Review the stretching,
    - Correct the curved curves with Beziers, add control points. Control points should be shown as "helper points", some of the previous helper points may be removed.
    - Add armhole_depth, and armhole_measurements on the pdf
    - may want to add some margin in the corset construction in some places
    - need to modify the rendering (in particular the rendering should be invariant to the stretching).

Finish the construction of the base corset.
Let's make a html website, where one can enter the measurements and get a printable construction pdf.
Then do the same with a real size pdf (or cut with various A4 and marks for the assembly).
Then integrate adverstising to the webpage.


Monetisation:
Model freemium: patron de base en taille 38.
Quelques constructions gratuites (ajouter des pinces, ...).
Variations de taille, sur-mesure payantes.
Marche: Pour les individus qui veulent une solution moins chere que Lectra et plus facile que Seamly2D.

Lectra fait beaucoup d'argents grace a l'optimization de la decoupe (2% de gain sur des enormes volumes, plusieurs millions).
Could make a software just for this, and try to sell it to them.
