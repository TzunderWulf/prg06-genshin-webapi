const express = require("express");

// import character model
let Character = require("../models/characterModel");

let routes = () => {
  let characterRouter = express.Router();

  // only continue execution, if the 'accept' header is JSON
  characterRouter.use("/", (req, res, next) => {
    if (req.headers.accept == "application/json") {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    } else {
      res
        .status(400)
        .send({ "error-message": "Only application/json is allowed." });
    }
  });

  // route for methods possible on collection resource
  characterRouter
    .route("/characters")
    .get((req, res) => {
      Character.find({}, (err, characters) => {
        if (err) {
          res.status(500).send({ "error-message": err });
        } else {
          let start, limit;

          if (req.query.start && req.query.limit) {
            start = parseInt(req.query.start);
            limit = parseInt(req.query.limit);
          } else {
            start = 1;
            limit = characters.length;
          }

          let totalItems = characters.length;
          let totalPages = Math.ceil(characters.length / limit);

          let firstPage, lastPage, prevPage, nextPage;
          let currentItems, currentPage;

          if (totalPages == 1) {
            firstPage = lastPage = prevPage = nextPage = currentPage = 1;
            currentItems = characters.length;
          } else {
            currentPage = Math.ceil(start / limit);

            // current amount of items is always the limit, except the last page
            currentPage == totalPages
              ? (currentItems = totalItems - (totalPages - 1) * limit)
              : (currentItems = limit);

            firstPage = 1;
            lastPage = (totalPages - 1) * limit + 1;

            // setting the previous page
            currentPage == 1 ? (prevPage = 1) : (prevPage = start - limit);
            // setting the next page
            currentPage == totalPages
              ? (nextPage = start)
              : (nextPage = start + limit);
          }

          let charactersCollection = {
            items: [],
            _links: {
              self: { href: `http://${req.headers.host}/characters` },
              collection: { href: `http://${req.headers.host}/characters` },
            },
            pagination: {
              currentPage: currentPage,
              currentItems: currentItems,
              totalPages: totalPages,
              totalItems: totalItems,
              _links: {
                first: {
                  page: 1,
                  href: `http://${req.headers.host}/characters?start=${firstPage}&limit=${limit}`,
                },
                last: {
                  page: lastPage,
                  href: `http://${req.headers.host}/characters?start=${lastPage}&limit=${limit}`,
                },
                previous: {
                  page: 1,
                  href: `http://${req.headers.host}/characters?start=${prevPage}&limit=${limit}`,
                },
                next: {
                  page: 1,
                  href: `http://${req.headers.host}/characters?start=${nextPage}&limit=${limit}`,
                },
              },
            },
          };

          let charactersOnPage = [];
          if (totalPages == 1) {
            charactersOnPage = characters;
          } else {
            let startPosition = start - 1;
            let endPosition = start + limit - 1;
            charactersOnPage = characters.slice(startPosition, endPosition);
          }

          for (let character of charactersOnPage) {
            let characterJSON = character.toJSON();

            characterJSON._links = {
              self: {
                href: `http://${req.headers.host}/characters/${characterJSON._id}`,
              },
              href: { href: `http://${req.headers.host}/characters` },
            };
            charactersCollection.items.push(characterJSON);
          }

          res.json(charactersCollection);
        }
      });
    })
    .post((req, res) => {
      if (
        req.headers["content-type"] == "application/json" ||
        req.headers["content-type"] == "application/x-www-form-urlencoded"
      ) {
        if (
          req.body.name == null ||
          req.body.region == null ||
          req.body.element == null
        ) {
          res
            .status(412)
            .send({ "error-message": "Please fill in all fields." });
        } else {
          let character = new Character(req.body);
          character.save((err) => {
            res.status(201).send(`Character created! ${character}`);
          });
        }
      } else {
        res.status(415).send({
          "error-message": `Only allowed to send data in the follwing formats: application/json or application/x-www-form-urlencoded.`,
        });
      }
    })
    .options((req, res) => {
      res.header("Allow", "GET,POST,OPTIONS");
      res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS").send();
    });

  // route for methods possible on detail resource
  characterRouter
    .get("/characters/:id", async (req, res) => {
      try {
        const character = await Character.findById(req.params.id);
        let characterJson = character.toJSON();

        characterJson._links = {
          self: {
            href: `http://${req.headers.host}/characters/${characterJson._id}`,
          },
          collection: {
            href: `http://${req.headers.host}/characters`,
          },
        };

        res.send(characterJson);
      } catch (err) {
        res.status(404).send({ "error-message": "This id doesn't exist." });
      }
    })
    .put("/characters/:id", async (req, res) => {
      const character = await Character.findById(req.params.id);

      if (
        req.body.name == "" ||
        req.body.region == "" ||
        req.body.element == "" ||
        req.body.name == null ||
        req.body.region == null ||
        req.body.element == null
      ) {
        res
          .status(412)
          .send({ "error-message": "Please don't empty out any fields." });
      } else {
        character.name = req.body.name;
        character.region = req.body.region;
        character.element = req.body.element;
        character.save((err) => {
          res.status(200).send(`Changed character!/n${character}`);
        });
      }
    })
    .delete("/characters/:id", async (req, res) => {
      try {
        await Character.deleteOne({ _id: req.params.id });
        res.status(204).send({ "error-message": "Character deleted!" });
      } catch (err) {
        res.status(404).send({ "error-message": "This id doesn't exist." });
      }
    })
    .options("/characters/:id", (req, res) => {
      res.header("Allow", "GET,PUT,DELETE,OPTIONS");
      res
        .header("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS")
        .send();
    });

  return characterRouter;
};

module.exports = routes;
