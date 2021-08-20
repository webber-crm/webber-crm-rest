const path = require('path')
const fs = require('fs')

const func = {
    async uploadUserImage(img) {
        const uploads = path.join(__dirname, '..', '..', 'assets', 'uploads')
        const images = path.join(__dirname, '..', '..', 'assets', 'uploads', 'images')

        fs.stat(uploads, function(err) {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.mkdir(uploads, err => { // путь, callback
                        if (err) throw new Error(err) // вывод ошибки

                        console.log('Folder "uploads" created')
                    })
                } else {
                    throw Error(err)
                }
            }
        });

        fs.stat(images, function(err) {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.mkdir(images, err => { // путь, callback
                        if (err) throw new Error(err) // вывод ошибки

                        console.log('Folder "uploads" created')
                    })
                } else {
                    throw Error(err)
                }
            }
        });

        // создание файла fs.writeFile()
        const uploadPath = path.join(images, img.name)
        const imagePath = path.join('uploads', 'images', img.name)

        await img.mv(uploadPath, function(err) {
            if (err) throw new Error(err)
        });

        return '/' + imagePath;
    },
    getJSONDataFromString(str) {
        try {
            str = JSON.parse(str)
        } catch (e) {
            str = [ str ]
        }

        return str;
    },
    getFormattedDate(date) {
        return {
            ru: date.toLocaleDateString('ru-RU'),
            en: date.toISOString().substring(0, 10)
        }
    }
}

module.exports = func