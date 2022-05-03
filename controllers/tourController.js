const Tour = require('../models/tourModels')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}
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



exports.getAllTours = catchAsync(async (req, res, next) => {
    // console.log(req.requestTime)
    
    console.log(req.query)
    // BUILD QUERY
    // 1a) Filtering
    // const queryObj = {...req.query}
    // const excludedFields = ['page', 'sort', 'limit', 'fields']
    // excludedFields.forEach(el => delete queryObj[el])

    // 1b) Advanced filtering
    
    // let queryStr = JSON.stringify(queryObj)
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    // console.log(JSON.parse(queryStr))
    
    // { difficulty: 'easy', duration: { $gte: 5}}
    
    // const tours = await Tour.find({
        //     duration: 5,
        //     difficulty: 'easy'
        // })


    // let query = Tour.find(JSON.parse(queryStr))


    // 2) Sorting
    // if(req.query.sort){
    //     const sortBy = req.query.sort.split(',').join(' ')
    //     console.log(sortBy)
    //     query = query.sort(sortBy)
        // sort('price ratingsAverage')
    // } else if(!req.query.page){
    //     query = query.sort('-createdAt')
    // }

    // 3) Field limiting
    // if(req.query.fields){
    //     const fields = req.query.fields.split(',').join(' ')
    //     query = query.select(fields)
    // } else{
    //     query = query.select('-__v')
    // }

    // 4) Pagination
    // const page = req.query.page * 1 || 1
    // const limit = req.query.limit * 1 || 100
    // const skip = (page - 1) * limit
    
    // query = query.skip(skip).limit(limit)
    
    // if(req.query.page){
    //     const numTours = await Tour.countDocuments()
    //     if(skip >= numTours) throw new Error('This page does not exist')
    // }

    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    const tours = await features.query

    // const tours = await Tour.find()
    // .where('duration')
    // .equals(5)
    // .where('difficulty')
    // .equals('easy')
    
    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        // requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    })    
    
})

exports.getTour = catchAsync(async (req, res, next) => {
    console.log(req.params)
    const tour = await Tour.findById(req.params.id)
    console.log(process.env.NODE_ENV)
    // Tour.findOne({ _id: req.params.id })
    
    if(!tour){
        return next(new AppError('No tour found with that ID', 404))
    }
    console.log('test')

    res.status(200).json({
        status: 'success',
        data:{
            tour
        }
    })
    
    // const id = req.params.id * 1
    // const tour = tours.find(el => el.id === id)

    // // if(id > tours.length){
    

    
})

exports.createTour = catchAsync(async (req, res, next) => {

    const newTour = await Tour.create(req.body)
    
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })

    // try{
        
    // } catch(err){
    //     res.status(400).json({
    //         status: 'fail',
    //         message: err
    //     })
    // }
})


exports.updateTour = catchAsync(async (req, res, next) => {

    
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!tour){
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    })

    
})

exports.deleteTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findByIdAndDelete(req.params.id)
    
    if(!tour){
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(204).json({
        status: "success",
        data: null
    })

})

exports.getTourStats = catchAsync(async (req, res, next) => {
    
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' }, 
                numTours: { $sum: 1 }, 
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ])

    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    })

   
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
   
    const year = req.params.year * 1

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`), 
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ])

    res.status(200).json({
        status: "success",
        data: {
            plan
        }
    })

    
})