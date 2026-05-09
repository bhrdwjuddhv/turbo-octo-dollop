import multer from "multer"
import path from "path"
import fs from "fs"

const uploadPath = path.join(process.cwd(), "public/temp")

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

export const upload = multer({ storage })