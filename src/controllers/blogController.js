const mongoose = require('mongoose')
const authorModel = require('../models/authorModel')
const blogModel = require('../models/blogModel')

//-------------- ISVALID FUNCTION
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
//---------------------ISVALIDREQUESTBODY FUNCTION
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
//------------------ISVALIDOBJECTID FUNCTION
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}



//CREATE BLOG THIRD API---------------------3
const createBlog = async function (req, res) {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide blog details' })
            return
        }

        // EXTRACT PARAMS
        const { title, body, authorId, tags, category, subcategory, isPublished } = requestBody;

        // VALIDATION STARTS
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: 'Blog Title is required' })
            return
        }
        if (!isValid(body)) {
            res.status(400).send({ status: false, message: 'Blog body is required' })
            return
        }
        if (!isValid(authorId)) {
            res.status(400).send({ status: false, message: 'Author id is required' })
            return
        }
        if (!isValidObjectId(authorId)) {
            res.status(400).send({ status: false, message: `${authorId} is not a valid author id` })
            return
        }
        if (!isValid(category)) {
            res.status(400).send({ status: false, message: 'Blog category is required' })
            return
        }

        // FIND AUTHORID BY AUTHOR MODEL
        const author = await authorModel.findById(authorId);
        // NOT VALID AUTHOR ID
        if (!author) {
            res.status(400).send({ status: false, message: `Author does not exit` })
            return
        }
        // VALIDATION ENDS 

        // EXTRACT PARAMS
        const blogData = { title, body, authorId, category, isPublished: isPublished ? isPublished : false, publishedAt: isPublished ? new Date() : null }
        if (tags) {
            if (Array.isArray(tags)) {
                blogData['tags'] = [...tags]
            }
            if (Object.prototype.toString.call(tags) === "[object String]") {
                blogData['tags'] = [tags]
            }
        }

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                blogData['subcategory'] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) === "[object String]") {
                blogData['subcategory'] = [subcategory]
            }
        }
        // CREATE BLOG
        const newBlog = await blogModel.create(blogData)
        res.status(201).send({ status: true, message: 'New blog created successfully', data: newBlog })
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message });
    }
}

//GET LIST OF BLOGS--------------------4
const listBlog = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false, isPublished: true }
        const queryParams = req.query
        if (isValidRequestBody(queryParams)) {
            let { authorId, category, tags, subcategory } = queryParams
            if (authorId || category || tags || subcategory) {
                if (isValid(authorId) && isValidObjectId(authorId)) {
                    filterQuery['authorId'] = authorId
                }
                if (isValid(category)) {
                    filterQuery['category'] = category.trim()
                }
                if (isValid(tags)) {
                    const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                    filterQuery['tags'] = { $all: tagsArr }
                }
                if (isValid(subcategory)) {
                    const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
                    filterQuery['subcategory'] = { $all: subcatArr }
                }
            }
            console.log(filterQuery)
            const getblogs = await blogModel.find(filterQuery)
            const countblog = getblogs.length
            if (!(countblog > 0)) {
                return res.status(404).send({ status: false, msg: "No blogs found" })

            }
            else {
                return res.status(200).send({ status: true, message: `${countblog} blog Found`, data: getblogs });

            }

        }
        else {
            const Allblogs = await blogModel.find()
            const countBlogs = Allblogs.length
            return res.status(200).send({ status: true, message: `Total ${countBlogs} Blogs`, data: Allblogs })
        }

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}





// FIND BLOG DATA AND UPDATE --------------5

const updateBlog = async function (req, res) {

    try {
        let decodeId = req.authorId
        let blogId = req.params.blogId;
        const requestBody = req.body

        // Validation stats
        if (!isValidObjectId(blogId)) {
            res.status(400).send({ status: false, message: `${blogId} is not a valid blog id` })
            return
        }
        const blog = await blogModel.findOne({ _id: blogId, isDeleted: false })
        if (!blog) {
            res.status(404).send({ status: false, message: `Blog not found or its deleted` })
            return
        }
        // BLOG.AUTHOR.ID===AUTHOR TOKEN WHICH IS GENERATED BY AUTHOR 
        if (blog.authorId != decodeId) {
            res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
            return
        }
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: true, message: 'No paramateres passed.Please provide details for blog update' })
            return
        }

        if (requestBody.hasOwnProperty("isPublished") == true) {
            let updatedValue = await blogModel.findOneAndUpdate({ _id: blogId, isDeleted: false }, {
                $set: {
                    title: req.body.title,
                    body: req.body.body,
                    category: req.body.category,
                    isPublished: req.body.isPublished,
                    publishedAt: Date.now()
                },
                $push: {
                    tags: req.body.tags,
                    subcategory: req.body.subcategory
                }
            }, { new: true })

            return res.status(200).send({ status: true, message: 'Blog update successfully', data: updatedValue });
        } else {
            let updatedValue = await blogModel.findOneAndUpdate({ _id: blogId, isDeleted: false }, {
                $set: {
                    title: req.body.title,
                    body: req.body.body,
                    category: req.body.category
                },
                $push: {
                    tags: req.body.tags,
                    subcategory: req.body.subcategory
                }
            }, { new: true })

            return res.status(200).send({ status: true, message: 'Blog update successfully', data: updatedValue });
        }

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })
    }
}


// DELETE BLOG DATA BY ID-------6
const deleteBlogByID = async function (req, res) {
    try {
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId
        const filterQuery = { isDeleted: false }
        if (!isValidObjectId(blogId)) {
            res.status(400).send({ status: false, message: `${blogId} is not a valid blog id` })
            return
        }
        if (!isValidObjectId(authorIdFromToken)) {
            res.status(400).send({ status: false, message: `${authorIdFromToken} is not a valid token id` })
            return
        }

        const blog = await blogModel.find(filterQuery)
        const countblog = blog.length
        if (!(countblog > 0)) {
            return res.status(404).send({ status: false, msg: "No blogs found" })

        }
        
        if (blog.authorId.toString() !== authorIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
            return
        }

        await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        res.status(200).send({ status: true, message: `Blog deleted successfully` })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

// DELETE BLOG DATA BY PARAMS----7
const deleteBlogByParams = async function (req, res) {
    try {
        let queryParams = req.query
        let decodeId = req.authorId;

        if (!isValidObjectId(decodeId)) {
            res.status(400).send({ status: false, message: `${authorIdFromToken} is not a valid token id` })
            return
        }
        if (!isValidRequestBody(queryParams)) {
            res.status(400).send({ status: false, message: `No query params received. Aborting delete operation` })
            return
        }

        if (queryParams.authorId != decodeId) {
            res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
            return
        } 
            let deleteData = await blogModel.findOneAndUpdate(queryParams, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
            res.status(200).send({ msg: deleteData, data: deleteData })
            return
        
    } catch (err) {
        console.log(err)
        return res.status(404).send({ status: false, msg: err.message })
    }



}

module.exports = {
    createBlog,
    listBlog,
    updateBlog,
    deleteBlogByID,
    deleteBlogByParams
}