# CS 4241 Final Project - DevelUP

## By Nicole Conill & Matthew Tolbert

Website Link: http://conill-tolbert-final.glitch.me/

Video Link: https://youtu.be/urqBT8JAeLo

## Project Logistics

#### Description:

DevelUP is a web-based application that allows users to log in via GitHub authentication.
Every user has access to their personal dashboard, where they may record their workouts
based on the date, muscle group targeted, exercise, rep count, and weight. During the
process of recording their information, they may at any time clear the form, and edit or
delete existing entries. For ease of viewment, the form to record a workout is hidden until
"Writedown a Workout" button is selected.

A chat board also exists for users, in which the first two users to log in will be connected,
and introduced by their GitHub names. Following connection, users can recieve any messages
that the opposing user types into the input box and sends. The most recent message recieved
is that of which is displayed to a user during a conversation.

#### Requirements:

This Web application correctly facets the three main sections of the 4241 course material,
as required, as well as the highly encouraged facet:

- **Static Web page content and design:** DevelUP was created with a fully customized CSS style
  to promote the design of the website. There are four different pages of content available
  throughout the website.
- **Dynamic behavior implemented with JavaScript:** Javascript is present on every page.
- **Server-side programming using Node.js** All workouts reside in persistent storage. 
GitHub authentication is implemented. Realtime communication is implemented.
- **Realtime communication technology:** Users may visit and communicate on the chat board.

## Deliverables

#### Remaining Project Information:

- **An outline of the technologies you used and how you used them:**

  For server management and page navigation, we utilized Express as our Node.js web application
  framework. The server handles directing requests made by users, such as visiting pages, logging
  in or out, and processing entries into the table.

  For persistent data storage and management, we utilized MongoDB as our database storage. Users can add, edit and delete their own entries. Furthermore, they can view the workouts of other users by name.
  
  For login authorization, we handled OAuth with GitHub, requiring access ID's and tokens.
  
  For realtime communication, we implemented a workout chat feature which takes advantage of the simple-peer
  library, which simplifies the use of WebRTC. For this interaction, when a user visits the chat page on their
  logged in account, the server then attempts to pair them with another user on the page. Using their usernames,
  the users are aware of the connection status to one another. This connection occurs instantly and we provide real
  time error feedback to the user if a connection error occurs. The server is only used for initial pairings, after
  connection, peers communicate with one another directly.
  
  For CSS stylization, every tag used recieved custom features to match the design of the website.
  Website icons were accessed using the the Font Awesome framework. Fonts were chosen from Google Fonts.

- **What challenges you faced in completing the project:**

  The greatest challenge was the implementation of the chat board (thank you to the Professor
  for his time in assisting us). Our issue stemmed from calling "app.listen()" instead of "server.listen()." While this
  was merely a small problem, it took a long time to resolve and was very frustrating for our team.
  
  Smaller challenges presented included stylistically determining the best portrayal of
  the website, such as menu presentation and button styles. Manipulating the form entries,
  and thus the script and server also presented several small challenges. One of these 
  included discovering a way to allow users to write their own input text, while still
  providing suggestions (as seen in the Muscle Group input and solved with the datalist tag).

- **What each group member was responsible for designing / developing:**
    
  Matt provided the basis of the website through the concept replication of previous projects, including the
  creation of the server and database that are used. The back-end construction and concepts 
  of the chat-board and the other users workout viewing were created and implemented by him. He also implemented the 
  login strategy of GitHub authorization, and created methods to prevent people from accessing
  user-only pages by the URL without being a user.

  Nicole created the design of the website with the fully customized CSS files, and variously
  wrote and applied them to each page of the project. Some amounts of front-end JavaScript was written for
  concepts such as displaying the workout entry form through a button press.
  She updated the previous replicated project's server, script and form inputs to
  work with information necessary for the final project. She also composed the README.md file.
