module.exports = {
    ifeq(a, b, options) {
        if (a == b) {
            return options.fn(this)
        }

        return options.inverse(this)
    },
    ifnoteq(a, b, options) {
        if (a != b) {
            return options.fn(this)
        }

        return options.inverse(this)
    },
    morethan(a, b, options) {
        if (a > b) {
            return options.fn(this)
        }

        return options.inverse(this)
    },
    lessthan(a, b, options) {
        if (a < b) {
            return options.fn(this)
        }

        return options.inverse(this)
    }
}