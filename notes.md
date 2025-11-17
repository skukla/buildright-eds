# Plan Feedback, Questions, and Considerations

## Phase 1

### 1.1

- Fine to create a new branch

### 1.2

- We need to ensure that the attributes defined for our products are included in the generation and ingestion scripts in the buildright-aco repository. That repository contains scripts for populating our Adobe Commerce Optimizer (ACO) instance with product data for this project.
- We also need to make sure that the business case and setup guide are updated to reflect this information.

### 1.3

- We need to ensure that the price books defined for our products and their relationships to each other are included in the generation and ingestion scripts in the buildright-aco repository. That repository contains scripts for populating our Adobe Commerce Optimizer (ACO) instance with product data for this project.
- We also need to make sure that the business case and setup guide are updated to reflect this information.

### 1.4

- Since policies can only be created manually in ACO, we need to ensure that the attributes necessary for creating all of our policies are included in our metadata.
- We also need to make sure that the business case and setup guide are updated to reflect this information.

Overall, I think the first phase of the plan looks good.

## Phase 2

### 2.1

- Tokens look good.

### 2.2

- For our block-first architecture, research how EDS anticipates manipulating the DOM and whether it makes sense to move our html into our javascript to mimic the block structure as closely as possible.
- Adobe Commerce Storefront, powered by Edge Delivery has the concept of Dropins. Research this concept here: <https://experienceleague.adobe.com/developer/commerce/storefront/sdk/>
- We need to think about what elements of the experience need to be Edge Delivery Service blocks, and what need to be custom dropins.  Then we should add a plan structure our html, css, and javascript accordingly.

## Phase 3

### 3.1

- The customer group structure looks good. We need to make sure that the setup guide reflects these groups.

### 3.2

- The mock ACO servicer layer looks good.

### 3.3

- Since we will eventually handle logins via the Adobe Commerce Auth dropin component and that component will be tied to a Commerce PaaS backend, we should research these things to ensure that we build our data accordingly. The User Auth dropin docs start here: <https://experienceleague.adobe.com/developer/commerce/storefront/dropins/user-auth/>. The User Account dropin docs start here: <https://experienceleague.adobe.com/developer/commerce/storefront/dropins/user-account/>

## Phase 4

- This phase looks good.

## Phase 5

- We may want to add a step to the plan for refacting our existing experience into components that follow Edge Delivery Service best practices. You'll need to research those.
- Remember the UserAuth dropin for login/authentication.

## Phase 6

- These screens need to reflect the professionalism of the audience for which they are designed. In my view, I do not think emoji-style icons are appropriate. We use custom icons elsewhere and should do the same throughout these screens. Take an inventory of the icons you think would be appropriate and then create them.

### 6.1

- This approach looks good. It may be a good idea to research examples of these templates so that we can ensure industry cohesion. You will need to produce fictitious floor plan names and diagrams, and potentially find images of similar-looking houses to serve as examples of a "finished build."

### 6.2

- This approach looks good. It may be worth while trying to find similar project-builder style wizards to reference for our designs.

I notice we don't have an experience planned for Lisa as part of this phase which I think may be a mistake. For a remodel experience, reference interior design sites and consider how we might incorporate the idea of packaged designs for Lisa's experience.

### 6.3

- Remember to reference the Home Depot deck builder example for the deck builder: <https://www.homedepot.com/project-seller/decking-calculator?choices=56057-1%2C56061-6%2C56067-10%2C56063-1%2C56212-Away%2520from%2520House%2C59467-Surface%2C57346-None%2C57344-None%2C57478-Composite%2520%2526%2520PVC%2C57615-Grooved%2520Edge%2C59910-Composite>
Lowes Deck Designer also follows similar practices: <https://deckdesigner.lowes.com/>

For all of the Phase 6 considerations (Sarah, Marcus, David) it may be a good idea to think about how we can show informational or educational content to help them achieve their tasks. We want to promote an immersive experience.

## Phase 7

- The data files look good.
- We need to ensure that all of the data that SHOULD be generated for ACO is included in these files and we can even consider incorporating the buildright-aco generation scripts as part of our data generation flow for our work here.

## Phase 8

- Are there any screens or design considerations necessary to support Kevin's user journey?

## Phase 9

- We need to check to see whether our existing home page, category pages, product detail pages, my account page, login page, and other pages need to be edited or redesigned to fit our use cases.
