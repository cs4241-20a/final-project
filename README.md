# WeMeet

# Authors: Jenna Galli, Brittany Henriques, Lauren Fleming, Thomas Graham

1. https://jegalli22-final-project-1.glitch.me/
   Our site is a fast and easy way to gather availabilities of group members in an organization. Not only can you create custom meetings,
   but you can also log your availibility given a meeting code.

2. To test our site, first create a meeting and get the code required for the availibilty page. Then a user can go back and use that same
   code to login to the meeting. Once that is done, enter in your availability and be taken to page to see all the availabilities of the
   members of your group. In a working enviorment, the meeting creator would send out the meeting code with the link so group members can login right away.

3. We used Node JS with an express server paired with MondoDB for our server side. This was done because of our knowledge of these technologies
   from previous assignments in the course. We used the express server and the MongoDB in order to hold the various data sets we had.
   When a user makes a schedule, an ID is created within the server and is stored with the days and times that they selected. Users are then able
   to take that code and enter it (along with their name and email) to load the schedule. Once a user submits their availability, this data is
   sent back to the server and stored under the schedule ID. The ID can then be used to fectch all the different availabilites submitted by
   different users and shows the different availability levels of the group as a whole.

4. There were a lot of issues on our backend working with our front end. Many of our requests weren't behaving as intended which led to a lot of frustration and
   change in the movement of flow of the program. For example, we ran into issues working with forms to submit data to the DB and have that data load onto our pages.
   For a reason we still do not know, whenever we used a form to take in the scheudle ID from the user, it would reload and reset the page. Since then we
   have taken the components we need out of the form, and instead created a div that works like the form. Another issue we ran into was how to take the data that the
   user put into the availability take and convert it to data that would be used to create a compiled table of all users schedules. We solved this by creating a
   series of arrays that looped through the table in order to get the data, and is then used to populate the compiled data. We also used nested fetch statements to
   retrieve data from both the meeting object and the user objects. These issues did take up a lot of time, and therefore led us to remove some features prevousily
   mentioned in our proposal.

5. Jenna Galli: I worked mostly on the create meeting page and the login and availibilty page and their relationship with the server. Many times I had to think of
   workarounds due to our time limit and functionality of our program. One of the features I implemented on the create Meeting Page
   was the ability to choose specific days of the week for a meeting. I also discussed with my group various ways
   to have our website flow and the advantages and disadvantages for the user.

Brittany Henriques: I worked mostly on the front end of the login, availability, and index pages, and aided in creating a basis for the various functions that we needed.
I helped with the function that was needed to created the availability table and the listeners necessary for it, as well as figuring out how to get our front end to work
with our back end. I also helped create the color scheme we use with inspiration from the glitch dream program, and worked on styling the layout of our application in
hopes of creating the best user experience.

Lauren Fleming: I worked mostly on the front end of the scheduling and availability pages. I implemented the features on the scheduling page that that creat a color scale and
display cumulative availability for each time block. I also created the event listener which shows the people who are available, tentative, and busy for each time block that
is clicked on, and added a cursive Google font to make the site prettier.

Thomas Graham: I worked mostly on the server and the login page. On there mostly I worked with the mongodb database and how the pages interact with each other. This is
for example like the submitting of a form and how the objects get to the database.

6. A link to your project video: https://www.youtube.com/watch?v=Ejh5Z3ctJX0

Think of 1,3, and 4 in particular in a similar vein to the design / tech achievements for A1—A4… make a case for why what you did was challenging and why your implementation deserves a grade of 100%.
-We used a Google font called Dancing Script.
