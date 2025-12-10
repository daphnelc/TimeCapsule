//Set up a server

// 0. load lowdb
// change require to import
// let express = require('express');
import express from 'express'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

let app = express();

// mydata db
const defaultData = { data: [] };
const adapter = new JSONFile('mydata.json');
const db = new Low(adapter, defaultData);

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

/* ---------------- page routes ---------------- */

// landing page
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// mydata page 
app.get('/mydata', (req, res) => {
  res.sendFile('mydata.html', { root: 'public' });
});

// note page per year
app.get('/note/:year', (req, res) => {
  res.sendFile('note.html', { root: 'public' });
});

/* ---------- Notes API: one note per year ---------- */

// GET note for a year
app.get('/api/note/:year', (req, res) => {
  let year = req.params.year;

  notesDb.read()
    .then(() => {
      let years = notesDb.data.years || {};
      let note = years[year];

      if (!note) {
        // no note yet → not locked
        return res.json({ year, text: "", locked: false });
      }

      let locked = false;
      if (note.openAt) {
        const now = new Date();
        const openAt = new Date(note.openAt);
        locked = now < openAt;
      }

      if (locked) {
        // don’t reveal text while sealed
        return res.json({
          year: note.year,
          text: "",
          locked: true,
          openAt: note.openAt
        });
      } else {
        return res.json({
          year: note.year,
          text: note.text,
          locked: false,
          openAt: note.openAt || null
        });
      }
    })
});


// POST note for a year 
app.post('/api/note/:year', (req, res) => {
  let year = req.params.year;
  let { text } = req.body;

  notesDb.read()
    .then(() => {
      if (!notesDb.data.years) {
        notesDb.data.years = {};
      }

      let now = new Date();
      let openAt = new Date(now);
      openAt.setFullYear(openAt.getFullYear() + 1);   // opens in 1 year

      notesDb.data.years[year] = {
        year,
        text: text || "",
        createdAt: now.toISOString(),
        openAt: openAt.toISOString()
      };

      return notesDb.write();
    })
    .then(() => {
      const note = notesDb.data.years[year];
      // don’t send text back when just sealed
      res.json({
        year: note.year,
        locked: true,
        openAt: note.openAt
      });
    })
});


