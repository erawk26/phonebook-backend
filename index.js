require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3001;
const Person = require("./models/person");

const originalSend = app.response.send;

app.response.send = function sendOverWrite(body) {
  originalSend.call(this, body);
  this.__custombody__ = body;
};
morgan.token("res-body", (_req, res) => res.__custombody__);

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(express.static("build"));
app.use(express.json());
app.use(cors());
app.use(morgan(":method :url :status :response-time ms - :res-body"));

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});
app.get("/info", (request, response, next) => {
  Person.countDocuments()
    .then((number) => {
      const d = new Date();
      response.send(`
  <h1>Phonebook has info for ${number} people.</h1>
  <small>${d.toString()}</small>
  `);
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((people) => {
      response.json(people);
    })
    .catch((error) => next(error));
});
app.post("/api/persons/", (request, response, next) => {
  const body = request.body;
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
  const person = new Person({ ...body });
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

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
  const newData = { ...body, modified: Date.now() };
  Person.findByIdAndUpdate(request.params.id, newData, { new: true })
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))
});
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findOneAndRemove({ _id: request.params.id })
    .then((result) => {
      console.log(result);
      response.status(204).json(result);
    })
    .catch((error) => next(error));
});
app.get("/api/persons/:id"+4, (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
