//Set up a server

// 0. load lowdb
// change require to import
// let express = require('express');
import express from 'express'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

let app = express();

// notes db
const notesDefault = { years: {} };
const notesAdapter = new JSONFile('notes.json');
const notesDb = new Low(notesAdapter, notesDefault);

//Serve a public folder
app.use(express.static('public'));
app.use(express.json());

//Start a server
let port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on localhost:${port}`);
});

/* -------------------------------------------------------------------------- */
/*                                 page routes                                */
/* -------------------------------------------------------------------------- */

// landing page
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// note page
app.get('/note/:id', (req, res) => {
  res.sendFile('note.html', { root: 'public' });
});


/* -------------------------------------------------------------------------- */
/*                                 GET routes                                 */
/* -------------------------------------------------------------------------- */

/* ----------------------------- Note paper API ----------------------------- */

// GET note for a capsule
app.get('/api/note/:id', (req, res) => {
  const id = req.params.id; // capsule id from url

  // Load the latest data from notes.json
  notesDb.read()
    .then(() => {
      const years = notesDb.data.years || {};
      const note = years[id];

      if (!note) {
        // no note yet → not locked
        return res.json({
          id,
          text: '',
          locked: false,
          openAt: null,
          createdAt: null,
          durationYears: null
        });
      }

      // Determine if this capsule should be locked or open
      let locked = false;

      // If the current time is before the openAt time, it is locked
      if (note.openAt) {
        const now = new Date();
        locked = now < new Date(note.openAt);
      }

      // If the capsule is locked, DO NOT send back the note text 
      if (locked) {
        return res.json({
          id: note.id || id,
          text: '', // hide content while locked
          locked: true,
          openAt: note.openAt || null,
          createdAt: note.createdAt || null,
          durationYears: note.durationYears || null
        });
      } else {
        // If the capsule is not locked, send back the full note text
        return res.json({
          id: note.id || id,
          text: note.text || '',
          locked: false,
          openAt: note.openAt || null,
          createdAt: note.createdAt || null,
          durationYears: note.durationYears || null
        });
      }
    })
});

/* ------------------------------- Capsule API ------------------------------ */

app.get('/api/capsules', (req, res) => {

  // Load the latest data from notes.json
  notesDb.read()
    .then(() => {
      const years = notesDb.data.years || {};
      const now = new Date();

      // Convert the "years" object into an array
      const capsules = Object.entries(years).map(([id, note]) => {
        // Determine if each capsule is locked or not
        let locked = false;
        if (note.openAt) {
          locked = now < new Date(note.openAt);
        }

        let label = id;
        if (note.openAt) {
          label = String(new Date(note.openAt).getFullYear());
        }

        return {
          id,
          label,
          locked,
          openAt: note.openAt || null,
          durationYears: note.durationYears || null
        };
      });

      // Send back all capsules as JSON
      res.json({ capsules });
    })
});

/* -------------------------------------------------------------------------- */
/*                                 POST routes                                */
/* -------------------------------------------------------------------------- */

// POST note for a capsule (create/update)
app.post('/api/note/:id', (req, res) => {
  const id = req.params.id; // capsule id from URL
  const { text, durationYears } = req.body; // data sent from front end

  //ChatGPT helped generating this code
  notesDb.read()
    .then(() => {
      // If "years" doesn't exist yet, create it
      if (!notesDb.data.years) {
        notesDb.data.years = {};
      }

      const now = new Date(); // when this note is created
      const openAt = new Date(now); // start from now

      // Make sure duration is a number between 1 and 10
      let yrs = parseInt(durationYears, 10);
      if (isNaN(yrs)) yrs = 1;
      if (yrs < 1) yrs = 1;
      if (yrs > 10) yrs = 10;

      // Add the number of years to get the open date
      openAt.setFullYear(openAt.getFullYear() + yrs);

      
      // Save the note data into the "years" object
      notesDb.data.years[id] = {
        id,
        text: text || '',
        createdAt: now.toISOString(),
        openAt: openAt.toISOString(),
        durationYears: yrs
      };

      // Write everything back to notes.json
      return notesDb.write();
    })

    // After saving, read back the note we just wrote
    .then(() => {
      const note = notesDb.data.years[id];

      // Respond with basic info about the saved note
      res.json({
        id: note.id,
        locked: true,  // newly saved notes start as locked
        openAt: note.openAt,
        createdAt: note.createdAt,
        durationYears: note.durationYears
      });
    });
});


