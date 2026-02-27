

Publish the website.

Check that the cli still works.
Remove the old folder.

Clean the website and make a big doc with everything.

Evaluate Zustand solution.
Clean the back-end.

Persistence of measurements, pattern selected and the modifications to the patterns.

Clean the measurements webpage and connected to the back-end.
Clean the pattern rack, the selection, and connect it to the back-end.
Clean the Atelier Modelism and connect it to the back-end.

Proto of each subpages more properly.

Proto of the flow
Flow between Pattern Shop and Modelism.
Save the current project, start a new project.
    Be able to save projects (like conversations).
    Be able to save measurements.

Clean the docs and the help.
Clean the Readme.

At the end of the readme, explain the diff with Seamly2D, Valentina, Clo3D and Leectra.

How to ensure the flow between the parts is really (maybe numeroting the numbers).

- Clean the docs and the readme.
- Populate the prototype with the existing pattern maker tool
- Work on the measurements.

Webapp
App sur ordinateur
App hosted online working on the browser
App on tablet.

Add a `license` file in the docs/
    Open source code
    IP on design and algorithm to create the pattern
    easy to use and contribute for many people
    being able to make money if the project works well
    barring concurrent applications from stealing and making a lot of money behind our back

For the name, try to optimize SEO, couture is too generic

How to do unit tests for the front-end.


Ajouter des pattrons: construction de la jupe, manche raglan

Long term dev: correct patttern construction

UX:

Add an option to switch languages.

Add size for various country.

Add an option to switch between black and light theme.

Design for me, what would I want this app to be to ease as much as possible my user experience.

Improve the back-end using the cli
- remove the baby dress.
- add ease.
- add seam allowance.

Make sure I can still use the back-end without going through the front-end
    - Create pdf to visualize them locally

Clean the back-end

Simplify docker to be lighter weight.



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
