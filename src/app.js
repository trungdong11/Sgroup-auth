const express = require('express');
const morgan = require('morgan');

const app = express();
const port = 4000;
const authRouter = require('../auth/router.js');
const usersRouter = require('../users/router.js');

app.use(express.json());
app.use(morgan('combined'));
app.use(express.urlencoded({extended: false}));

app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
    console.log(`Server is listening on port $(port)`);
});

