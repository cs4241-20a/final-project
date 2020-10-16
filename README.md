# CS4241 Group 14 Final Project

Matthew Gulbin, Alan Curiel, Madeline Perry, Saniya Syeda  
CS4241  
October 16, 2020  

**Link to Project:** 

**1. Description:** 
A browser home page application that has customizable boxes/categories that users can fill in to have bookmarks, notes, tasks, and images. The idea is that the user will open their browser and use this page to start their day/work/session. The user will be able to log in so that their content persists between sessions. This application is targeted at users who use their computers on a daily basis and would like a customizable web browsing experience. The application will make use of a database in MongoDB to store the homepage layout, input, preferences, etc.  

***Key Features:***
Draggable content boxes (ex. box for bookmarks, notes, tasks, etc.)  
Login page, each user will have a different homepage.  
Persistent data between sessions  
Customization for elements (background color, box size, text size, font style/color)  
Github login  

**2. Application Instructions:**  
The application authorizes users via Github. To login, go to the settings button in the top left and click "Log In" in the dropdown. The settings dropdown also contains options for changing the background color, primary color, accent color, and text color. To save your color preference, click the "Save Settings" button in the top right. To add new boxes, go to the "Add New Category" dropdown in the top right and click on the type of box preferred (regular text, bookmarks, or to-do). The boxes are resizable and draggable. To save content within each box, click the save icon in the top right of the box. To delete, click the x button. To edit a bookmark, click the edit button next to each link. To go to that link, click the edit button again, which allows the user to click on the link. 

**3. Technologies Used:**
fksdjflsdjfdl

**Challenges:**
Making each box both draggable, resizable, and editable (had issues with not having a "handle" for each box, which prevented the content inside from being editable. We had to figure out how to generate unique id's for each box handle and pass each one into a drag element function so that each one could respond to the mouse drag event.
Sending different kinds of data to the server, e.g:
- Saving the position of each box across sessions to restore in the same place on the page on pageload.
- Saving the colors of each element class (background, primary, accent, text) and restoring them on pageload.
Making the bookmark links both editable and clickable (to bring user to that page).
CSS styling for header dropdowns and individual kinds of buttons


**5. Work Division**
Matthew: Database, front-end JS  
Alan: Backend server (Node/express), bit of front-end js  
Madeline: HTML/CSS, front-end JS   
Saniya: HTML/CSS, front-end JS  

The README for your second pull request doesn’t need to be a formal report, but it should contain:

1. A brief description of what you created, and a link to the project itself.
2. Any additional instructions that might be needed to fully use your project (login information etc.)
3. An outline of the technologies you used and how you used them.
4. What challenges you faced in completing the project.
5. What each group member was responsible for designing / developing.
6. A link to your project video.

Think of 1,3, and 4 in particular in a similar vein to the design / tech achievements for A1—A4… make a case for why what you did was challenging and why your implementation deserves a grade of 100%.
