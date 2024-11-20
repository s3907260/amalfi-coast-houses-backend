require('dotenv').config()
const jwt = require('jsonwebtoken')
let crypto = require('crypto');
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')

class Utils {

    hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');
        return [salt, hash].join('$');
    }

    verifyHash(password, original) {
        const originalHash = original.split('$')[1];
        const salt = original.split('$')[0];
        const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');
        return hash === originalHash;
    }

    generateAccessToken(user) {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
    }

    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) {
            return res.status(401).json({
                message: "Unauthorised"
            })
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({
                    message: "Unauthorised"
                })
            }
            req.user = user
            next()
        })
    }

    uploadFile(file, uploadPath, callback) {
        // get file extension (.jpg, .png etc)
        const fileExt = file.name.split('.').pop()
        // create unique file name  
        const uniqueFilename = uuidv4() + '.' + fileExt
        // set upload path (where to store image on server)
        const uploadPathFull = path.join(uploadPath, uniqueFilename)

        // Check if directory exists, if not create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Create directory and its parent folders if necessary
        }
        // move image to uploadPath
        file.mv(uploadPathFull, function (err) {
            if (err) {
                console.log(err)
                return false
            }
            if (typeof callback == 'function') {
                callback(uniqueFilename)
            }
        })
    }

    deleteFile(filePath, callback) {
        const relativePath = filePath.substring(filePath.indexOf('images/'));
        const fullPath = path.join(__dirname, 'public', relativePath);
        // Check if the file exists
        if (fs.existsSync(fullPath)) {
            // Delete the file
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.log(`Error deleting file at ${fullPath}:`, err);
                    return false;
                }
                console.log(`File deleted: ${fullPath}`);
                if (typeof callback === 'function') {
                    callback(true); // Notify success via callback
                }
            });
        } 
    }


}

module.exports = new Utils()