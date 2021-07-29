const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(express.static('build'));
app.use(express.json());
app.use(cors());
const originalSend = app.response.send;

app.response.send = function sendOverWrite(body) {
  originalSend.call(this, body);
  this.__custombody__ = body;
};

morgan.token("res-body", (_req, res) => res.__custombody__);

app.use(morgan(":method :url :status :response-time ms - :res-body"));
let persons = [
  {
    name: "Arto Hellas",
    number: "123-456-1122",
    id: 1,
    updated: 1627285810180,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
  {
    name: "Arthur Jones",
    number: "39-23-7686969",
    id: 5,
  },
  {
    name: "Erik Olsen",
    number: "+1-802-851-5512",
    id: 6,
  },
  {
    name: "Arto Hella",
    number: "123-456-1122",
    id: 7,
  },
  {
    name: "Erik",
    number: "123-654-7890",
    id: 8,
    updated: 1627340096233,
  },
  {
    name: "Kire Neslo",
    number: "321-456-7890",
    id: 10,
    updated: 1627340196233,
  },
];
const getNewId = () => {
  const id = Math.floor(Math.random() * 10000000);
  return persons.map((p) => p.id).includes(id) ? newId() : id;
};
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});
app.get("/info", (request, response) => {
  const d = new Date();
  response.send(`
  <h1>Phonebook has info for ${persons.length} people.</h1>
  <small>${d.toString()}</small>
  `);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});
app.post("/api/persons/", (request, response) => {
  const body = request.body;
  if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }
  if (!body.name) {
    return response.status(400).json({
      error: "You didnt enter a name",
    });
  }
  if (!body.number) {
    return response.status(400).json({
      error: "You didnt enter a phone number",
    });
  }
  const person = {
    ...body,
    date: Date.now(),
    id: getNewId(),
  };
  persons = persons.concat(person);

  response.json(person);
});
app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  const id = Number(request.params.id);

  if (!body.name) {
    return response.status(400).json({
      error: "You didnt enter a name",
    });
  }
  if (!body.number) {
    return response.status(400).json({
      error: "You didnt enter a phone number",
    });
  }

  persons = persons.map((p) => (p.id !== id ? p : body));

  response.json(body);
});
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (person) {
    persons = persons.filter((p) => p.id !== id);
    response.status(204).json(person);
  } else {
    response.status(404).end;
  }
});
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
