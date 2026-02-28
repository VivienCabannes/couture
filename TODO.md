
# App TODO
#### Clean the back-end:
Backend/{python,rush}
Better organization of the backend
Make the sure the cli manipulation are intuitive.
Check that the cli still works.

#### Clean the docs and the vision
Document the flow
Make help super clear
Add a note of the "perroquet/french ruler" vs Bezier curves.
At the end of the readme, explain the diff with Seamly2D, Valentina, Clo3D and Leectra.
Document how to make a iOS/Android tablet app, a MacOS/Window Desktop app, publish the website online.
Document Docker, Rust... What is React, React Native...

#### Ensure persistance of the right obejcts on the website
Persistence of measurements, pattern selected and the modifications to the patterns.
Evaluate Zustand solution.
Ensure it work well with the back-end.
Option to save a project.

#### Improve the measurements webpage
Clean list of measure
Man and Woman
Nice visualization of the body with measure getting highlighted.
Make a prototype?
(Not a priority) Add size for various country.

#### Prototype for the pattern rack
Inspiration from sewist.com
Make a prototype?

#### License
Open source code
IP on design and algorithm to create the pattern
easy to use and contribute for many people
being able to make money if the project works well
barring concurrent applications from stealing and making a lot of money behind our back

#### Naming
For the name, try to optimize SEO, couture is too generic

#### Dev
How to do unit tests for the front-end.
Keep it mind that we are developping with ourselves in mind: WE should love the product

# Core technology TODO

Work on the core tech.
Better rendering of the SVG.
Option to print the pattern on a printer.

Ajouter des pattrons: construction de la jupe, manche raglan
Long term dev: correct patttern construction
- add ease.
- add seam allowance.

#### Code Review

I have some constraint, I want to make sure that all my Bezier curves never crosses the Starting point - Control point line, can you make a test to make sure that none of these happen. If so can you raise a warning.
Review the bezier point construction, extract utilities functions such as contrains to pass by some points.
Can you make sure the the sleeve_pattern follows roughly the same structure as the corset_pattern (ControlParameters, build_construction_points, build_bezier_helper_points, _plot_reference, _plot_printable, ...)?
Add a function to compute armhole_depth, and armhole_measurements in the corset measurment, add it to the construction plot.

#### Better construction of the curves

Control parameters for the curves A1 to B1 and B1 to C1.
Option to aisance aux differents endroits.

#### Rendering

Add waist, bust and shoulder level.
Clean the code, maybe extract a generic ConstructionRendering and PatternRendering.

#### Better rendering of the Construction plot

Clean coordinates rendering

#### Better rendering of the Pattern plot

Option to print over several A4 stuffs with margin to help reassemble.
Add option to add seam allowance.
