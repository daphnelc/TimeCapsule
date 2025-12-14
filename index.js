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

/* ---------------- page routes ---------------- */

// landing page
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// mydata page 
app.get('/mydata', (req, res) => {
  res.sendFile('mydata.html', { root: 'public' });
});

// note page
app.get('/note/:id', (req, res) => {
  res.sendFile('note.html', { root: 'public' });
});


/* ---------- Note paper API ---------- */

// GET note for a capsule
app.get('/api/note/:id', (req, res) => {
  const id = req.params.id;

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

      let locked = false;
      if (note.openAt) {
        const now = new Date();
        locked = now < new Date(note.openAt);
      }

      if (locked) {
        return res.json({
          id: note.id || id,
          text: '',
          locked: true,
          openAt: note.openAt || null,
          createdAt: note.createdAt || null,
          durationYears: note.durationYears || null
        });
      } else {
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

// POST note for a capsule (create/update)
app.post('/api/note/:id', (req, res) => {
  const id = req.params.id;
  const { text, durationYears } = req.body;

  notesDb.read()
    .then(() => {
      if (!notesDb.data.years) {
        notesDb.data.years = {};
      }

      const now = new Date();
      const openAt = new Date(now);

      let yrs = parseInt(durationYears, 10);
      if (isNaN(yrs)) yrs = 1;
      if (yrs < 1) yrs = 1;
      if (yrs > 10) yrs = 10;

      openAt.setFullYear(openAt.getFullYear() + yrs);

      notesDb.data.years[id] = {
        id,
        text: text || '',
        createdAt: now.toISOString(),
        openAt: openAt.toISOString(),
        durationYears: yrs
      };

      return notesDb.write();
    })
    .then(() => {
      const note = notesDb.data.years[id];
      res.json({
        id: note.id,
        locked: true,
        openAt: note.openAt,
        createdAt: note.createdAt,
        durationYears: note.durationYears
      });
    });
  });
  /* ---------- list all capsules for main page ---------- */

  app.get('/api/capsules', (req, res) => {
    notesDb.read()
      .then(() => {
        const years = notesDb.data.years || {};
        const now = new Date();

        const capsules = Object.entries(years).map(([id, note]) => {
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

        res.json({ capsules });
      })
      .catch(err => {
        console.error('Error reading capsules:', err);
        res.status(500).json({ error: 'Error reading capsules' });
      });
  });

