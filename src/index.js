const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const users = [];

app.use(express.json());
app.use(cors());

function checkExistsUserAccount(request, response, next){
    const { username } = request.headers;

    const user = users.find(user => user.username === username);

    if(!user){
        return response.status(404).json({error: "Username not found"});
    };

    request.user = user;

    return next();
}

app.post("/users", (request, response) =>{
    const { name, username } = request.body;

    const usernameAlreadyExists = users.some(user => user.username === username);

    if(usernameAlreadyExists){
        return response.status(404).json({error: "Username already exists"});
    }
    
    users.push({ 
        id: uuidv4(), // precisa ser um uuid
        name,
        username,
        todos: []
    });

    return response.status(201).json(users);
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.status(200).json(user);

});

app.post("/todos", checkExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;

    const todoOperation = { 
        id: uuidv4(), // precisa ser um uuid
        title,
        done: false, 
        deadline: new Date(deadline), 
        created_at: new Date()
    };

    user.todos.push(todoOperation);

    return response.status(201).json(todoOperation);
});

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;
    const { id } = request.params;

    const checkTodoExists = user.todos.find(todo => todo.id === id);

    if(!checkTodoExists){
        return response.status(404).json({error: "Todo not found"});
    };

    checkTodoExists.title = title;
    checkTodoExists.deadline = new Date(deadline);

    return response.json(checkTodoExists);
    
});

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const checkTodoExists = user.todos.find(todo => todo.id === id);

    if(!checkTodoExists){
        return response.status(404).json({error: "Todo not found"});
    };

    checkTodoExists.done = true;

    return response.status(200).json(checkTodoExists);
});

app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todoIndex = user.todos.findIndex(todo => todo.id === id);

    if(todoIndex === -1){
        return response.status(404).json({error: "Todo not found"});
    };

    user.todos.splice(todoIndex, 1);

    return response.status(200).send({message: "Todo deleted!"});
})

app.listen(3333);