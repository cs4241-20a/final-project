# CS4241 Group 14 Final Project

 

Matthew Gulbin, Alan Curiel, Madeline Perry, Saniya Syeda  
CS4241  
October 16, 2020  

 

**Link to Project Application:**   
**Link to Project Video:**

 

**1. Description:**  
A browser home page application that has customizable boxes/categories that users can fill in to have bookmarks, notes, tasks, and images. The idea is that the user will open their browser and use this page to start their day/work/session. The user will be able to log in so that their content persists between sessions. This application is targeted at users who use their computers on a daily basis and would like a customizable web browsing experience. The application will make use of a database in MongoDB to store the homepage layout, input, preferences, etc.  

 

  ***Key Features:***
  * Draggable content boxes (bookmarks, simple notes, to-do lists, etc.)  
  * Login page, each user will have a different customizable homepage.  
  * Persistent data between sessions  
  * Customization for elements (background/primary/accent/text color, resize boxes, delete boxes)  
  * Github Login and authorization  

 

**2. Application Instructions:**  
The application authorizes users via Github. To login, go to the settings button in the top left and click "Log In" in the dropdown. The settings dropdown also contains options for changing the background color, primary color, accent color, and text color. To save your color preference, click the "Save Settings" button in the top right. To add new boxes, go to the "Add New Category" dropdown in the top right and click on the type of box preferred (regular text, bookmarks, or to-do). The boxes are resizable and draggable. To save content within each box, click the save icon in the top right of the box. To delete, click the x button. To add a bookmark, click the plus icon on the right hand side of the card. To edit a bookmark, click the edit button next to each link. To go to that link, click the edit button again, which allows the user to click on the link. 

 

**3. Technologies Used:**
* sakura.css template for styling
* iro.ColorPicker API for customizing homepage colors
* Font Awesome icons for edit, save, delete icons
* MongoDB for storing user data/settings
* Node JS, express middleware for server
  * body-parser, compression, cors, express-session, passport, passport-github

 

**Challenges:**  
* Making each box both draggable, resizable, and editable (had issues with not having a "handle" for each box, which prevented the content inside from being editable. We had to figure out how to generate unique id's for each box handle and pass each one into a drag element function so that each one could respond to the mouse drag event.
* Sending different kinds of data to the server, e.g:
  * Saving the position of each box across sessions to restore in the same place on the page on pageload.
  * Saving the colors of each element class (background, primary, accent, text) and restoring them on pageload.
  * Saving new bookmarks/to-do items as the user creates them
* Making the bookmark links both editable and clickable (to bring user to that page).
* CSS styling for header dropdowns and individual kinds of buttons (dropdown buttons vs icon buttons vs regular buttons)

 

**5. Work Division**  
To collaborate on the project simultaneously, our group used VSCode's LiveShare function to view eachother's live edits as well as the updated localhost port. We also shared a GitHub repo to push any changes made when working on the project individually outside of group meetings.
* *Matthew:* Database, front-end JS (persisting box content, adding items from list, draggable box handles)
* *Alan:* Backend server (Node/express), front-end js (user authentication, persisting settings, colors, position)
* *Madeline:* HTML/CSS styling (header dropdowns, icons), front-end JS (changing app colors with picker, changing header to username)
* *Saniya:* HTML/CSS styling (card styles, positioning) front-end JS (updating style colors onload, card handles)
