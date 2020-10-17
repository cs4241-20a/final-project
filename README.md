# Project Description

Kōcha (紅茶, こうちゃ), meaning black tea in English, is a project to promote the process of memory by utilizing the forgetting curve to plan the schedule for remembering. 

Inspired by After School Tea Time in _K-On!_, great works should be able to be done in a relaxed and happy way, and memory is no exception. Memory plays an significant role in our learning process and is a critical element for us. The mission of Kocha is to enable people to remember anything they want more efficiently in spare time.


# Link to project

http://zphw-final-project.glitch.me/login

# Link to project video

https://youtu.be/WMOXEtnlEbw


# API Documentation

https://docs.google.com/document/d/1r69ruuweX3tWmkNvEwO1g0pDqGAISwfV1Hrwxh66glY/edit?usp=sharing


# Additional instructions to use the project
Demo user: test/test

# Workflow
1. Sign up an account
2. Import entries that you wanted to remember
3. New entries will be pushed to user's homepage.
4. Past ones needed to be reviewed will be pushed based on the forgetting curve.
5. Users can check all entries already been added and can delete entries.
6. Click the play button in the music box to relax ;)


# Challenges in completing the project
- To personalize the stylesheet was much more time-consuming then we expected.
- It's little bit hard to write back-end code for edited table.
- When useing the /mark api, it was hard to identify the _id of the object. Finally I went around this problem by saving the _id in a hidden division, which is not save.


# Group member
- Pinhan Zhao: Developed the back-end API server and wrote the API documentation. Created data structures for the database.
- Wenjing Ying: Created the functions in the front-end that implements the back-end API, including adding, editing, displaying the wordlist, etc. 
- Zaiyang Zhong: Created most of front-end user interfaces in the main page and log-in and personalized css framwork to them. I also added a canvas element to create a 2d music player, which is very similar to what i did in A4. I developed a small portion of js codes.
