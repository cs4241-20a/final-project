# Drawsome
Drawsome is a simple and accessible service to view, create, and share digital drawings online. Users who enter the site may create works in-browser and browse works that have been published on the platform. Registered users are able to save prior works, as well as publish them to be seen by everyone. The intended users of Drawsome are people who are interested in drawing or sketching and that would like to share their work.

- [Drawsome](http://mbsr.wpi.edu:40404)
- [Project Video](https://youtu.be/kLMMFPviwZk)

### Team 1
- Bryce Corbitt
- Pooja Patel

## Instructions
**How To: Login**
- Users can log in by OAuth2 authentication through Google on the 'Home' page

**How To: Draw**
- Navigate to the ‘Draw’ page
- Use the color picker to select a color to draw with
- To clear the board, undo previous lines, and erase you can use the buttons to the left of the canvas to perform those operations
- Use the brush-radius sliding tool to adjust the brush to be smaller or larger
- Be creative!

**How To: Publish and Save a Drawing**
- After completing a drawing on the page fill out the fields below ‘Save/Publish Drawing’, ‘Name’ and ‘Title’ are required fields
- If you would like to have your art piece to be published in the gallery, toggle the switch to publish
- Click ‘Save’

**How to: View All Your Drawings**
- Navigate to the ‘My Drawings’ tab
- This is where all of your drawings are held

**How to: View All Published Drawings**
- Navigate to the ‘Gallery’ tab
- This is where all published drawings are held

**How to: Logout**
- Click the ‘Sign Out’ button in the navigation bar

## Technologies Outline
**Backend**
- Node.js Express server that hosts a REST API
 	- Express routes for authentication with back-end, validation of Google id_tokens, and User/Drawing requests.
- MongoDB + Mongoose for modelling and persisting user data
	- Mongoose models created for Drawings, Users
- OAuth2 Authentication through Google
	- Created a Google Cloud Platform Project
	- Created an OAuth2 Client ID
	- Enabled valid development and deployment source/redirect URLs 
	- Preserved credentials in .env file
	
Hosted and Deployed on WPI (MQP) virtual machine 
  
**Frontend**
- React Application
	- Several React components were used in this project for frontend development.
  - react-canvas-draw and react-color were used to provide an elegant canvas interface with drawing controls
	- The react-canvas-draw component was used for the drawing canvas, the tool to adjust brush size, to save and to undo.
	- The react-color component was used for the color picker
  - react-bootstrap & bootswatch for CSS boilerplate and theming
	- react-bootstrap was used for various components including: container, row, col, button, and form
	- bootswatch was used for the theming of Drawsome. The selected theme was ‘Sketchy’
- REST API Client carried out with axios
	- Client API singleton connects + authenticates with server
	- Provides wrapper functions for each API call using axios
- react-router-dom for self-contained site navigation
	- HashRouter navigation in root component
	- History integrated to preserve state when user navigates to previous page

## Challenges
**Pooja**

Working with the React components was challenging, especially working with various states. However, by looking at documentation, online sources, and getting clarification the concepts became more clear.

**Bryce**

The carousel, while visually appealing, was an unpleasant experience to implement. You may not want to take a look at the source, because it is rather scary, but we managed to create a hack to take the canvas data and turn it into data PNGs to render in the carousel (as the carousel will not render canvases). 


## Workload Split
**Bryce Corbitt**
- Back-end (Express REST API, MongoDB/Mongoose Models, etc.)
- Carousel
- "My Drawings" Paginated Feed + Gallery

**Pooja Patel**
- Integrating react-canvas-draw and react-colors for drawing capability
- Styling the ‘Draw’ page through CSS 

