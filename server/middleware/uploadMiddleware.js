import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/resumes");
    },
    filename(req, file, cb) {
        cb(
            null,
            `${Date.now()}-${file.originalname.replace(/\s+/g, "")}`
        );
    }
});

function checkFileType(file, cb) {
    const filetypes = /pdf|docx/;
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype =
        file.mimetype === "application/pdf" ||
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb("Only PDF and DOCX files are allowed");
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

export default upload;
