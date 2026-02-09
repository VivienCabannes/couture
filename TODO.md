## Code Review

I have some constraint, I want to make sure that all my Bezier curves never crosses the Starting point - Control point line, can you make a test to make sure that none of these happen. If so can you raise a warning.

Review the bezier point construction, extract utilities functions such as contrains to pass by some points.

Can you make sure the the sleeve_pattern follows roughly the same structure as the corset_pattern (ControlParameters, build_construction_points, build_bezier_helper_points, _plot_reference, _plot_printable, ...)?

Add a function to compute armhole_depth, and armhole_measurements in the corset measurment, add it to the construction plot.

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

Add option to add seam allowance.

## Going forward

Let's make a html website, where one can enter the measurements and get a printable construction pdf.
