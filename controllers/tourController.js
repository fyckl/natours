const Tour = require('../models/tourModels')

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

// exports.checkID = (req, res, next, val) => {
//     console.log(`Tour id is: ${val}`)
//     if(req.params.id * 1 > tours.length){
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         })
//     }
//     next()
// }

// exports.checkBody = (req ,res, next) => {
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Name or price not found'
//         })
//     }
//     next()
// }

exports.getAllTours = (req, res) => {
    // console.log(req.requestTime)
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        // results: tours.length,
        // data: {
        //     tours
        // }
    })
}

exports.createTour = async (req, res) => {

    try{
        const newTour = await Tour.create(req.body)
    
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch(err){
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent'
        })
    }
}

exports.getTour = (req, res) => {
    console.log(req.params)
    
    const id = req.params.id * 1
    // const tour = tours.find(el => el.id === id)

    // // if(id > tours.length){
    

    // res.status(200).json({
    //     status: 'success',
    //     data:{
    //         tour
    //     }
    // })
}

exports.updateTour = (req, res) => {
   
        res.status(200).json({
        status: "success",
        data: {
            tour: '<Updated tour here...>'
        }
    })
}

exports.deleteTour = (req, res) => {

     
    res.status(204).json({
        status: "success",
        data: null
    })

}