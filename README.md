# Simple web-api
A simple web-api built as an assignment for school (PRG06) with it's subject being characters of _Genshin Impact_. As the title suggest, it's a rather simple web-api, with not too many layers added. It features an index page with all characters stored, only showing their name. Each characters also has a detail page, with their full information showed.

## Data contained within
Each character has the following information:
* name
* element
* region

## Allowed methods
On the __index__ page the following methods are allowed: GET, POST, OPTIONS.

On a __detail__ page (of a specific character) the following methods are allowed: GET, PUT, DELETE, OPTIONS.

### Notes
* On the POST only strings are put within the database.
* None of the fields of a POST may be empty.
* There is currently no way to recover deleted items.
* The webservice only sends JSON back, and accepts JSON and x-www-url-encoded.
