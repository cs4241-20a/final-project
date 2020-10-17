# cs4241-FinalProject:Taskinator

README

Project Description 
==========================
[link]

Taskinator is a website that allows users to keep track of their tasks for a project. This website provides a simplistic yet useful interface to allow users to create groups, add team members to the groups, and assign tasks to each member. Hence, it specifically targets people who are working on a team project and need an organizational tool. 

The website consists of three pages: a login page, a home page, and a task page. Logging in leads the users to the home page where they can see what groups they are a part of, or create new groups. The homepage also shows a list of tasks that are approaching their deadline or that are overdue. Clicking on each group leads to a task page corresponding to that group. Each task page allows the user to add lists of tasks where different lists can pertain to different categories of task. On this page, the user can also invite other team members. Additionally, the task page has a chat feature that allows real-time communication for the team members, making it easier for them to discuss their project as they organize their tasks.


Additional Instructions
========================

Taskinator requires the users to have a GitHub or a Google account to login with.

Utilized Technologies
======================
- Materialize Framework
    We used Google's Materialize framework to stylize the entire website and better the functionalities of the html elements.
- Javascript
- Node.js
    We used Node.js for server-side programming.
- MongoDB for Server + Mongoose
    We used a combination of MongoDB and Mongoose to ensure persistence of data for each user.
- OAuth Authentication (from multiple services Google, GitHub)
    We used Google and GitHub OAuth Authentications to have the users log into the website.
- Socket io
    We used Socket io for the live chat feature on the task page.
- Moment.js
    We used Moment.js to handle due dates of each task.

Challenges Faced
=====================
An expected challenge we faced was deciding on the most appropriate technologies for this project. Along the same lines, it was also a bit difficult to make sure we found a good balance between having this website do all we desired while also meeting the requirements of the assignment. We couldn't schedule regular meetings as a team but were able to use Teams for effective communication.

Member Responsibilities
=======================
Benny: Front-end, page layout and styling
Luke: Back-end, databases and authentication + socket.io
Nikhil: Front-end, Javascript for authentication, task-list, group selection
Rimsha: Front-end, page layout and styling
Adam: Chat-based functionality (socket.io)

Project video
===============
[link]

