const express = require('express')
const morgan = require('morgan')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

// 1) Middle wares
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use(express.json())

app.use(express.static(`${__dirname}/public`))

// app.use((req, res, next) => {
//     console.log('Hello from the middleware 😊')
//     next()
// })

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

// app.get('/', (req, res) => {
//     res
//     .status(200)
//     .json({
//         message: 'Hello from the server side!',
//         app: "Natours"
//     })
// })

// app.post("/", (req, res) => {
//     res.send('You can post to this end point...')
// })

// 2) Route handlers

// app.get('/api/v1/tours', getAllTours) 
// app.post('/api/v1/tours', getTour)
// app.get('/api/v1/tours/:id', createTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

// 3) Routes

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl}`
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statusCode = 404

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})


app.use(globalErrorHandler)

module.exports = app
// 4) Start server
