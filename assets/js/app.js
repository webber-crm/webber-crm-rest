
const pageSingleCustomer = new Vue({
    el: '#page-single-customer',
    data: {
        switcher: false,
        avatar: false,
        avatarDefaultSrc: "https://bulma.io/images/placeholders/128x128.png",
        avatarSrc: "https://bulma.io/images/placeholders/128x128.png",
        tab: null,
        domain: "demo.com",
        domains: [
            "demo.com"
        ]
    },
    methods: {
        addTag(e) {
            const btn = e.target
            const field = btn.closest('.tags-add-field')
            const input = field.querySelector('.tags-add-input')
            const value = input.value

            if (value) {
                this.domains.push(value)
                if (this.switcher) {
                    this.domain = ""
                }
            }
        },
        deleteTag(domain) {
            const idx = this.domains.findIndex(d => d === domain)
            this.domains.splice(idx, 1)
        },
        uploadAvatar(e) {
            const fileInput = e.target
            const readFile = URL.createObjectURL(fileInput.files[0])
            this.avatarSrc = readFile
            this.avatar = true
        },
        deleteAvatar() {
            this.avatar = false
            this.avatarSrc = this.avatarDefaultSrc
        }
    },
    computed: {
        domainsJSON() {
            return JSON.stringify(this.domains)
        }
    },
    created() {
        const src = document.getElementById('avatar').dataset.src

        if (src) {
            this.avatarSrc = src
            this.avatar = true
        }
    }
})

const pageAuth = new Vue({
    el: '#auth',
    data: {
        name: "",
        email: "",
        passwd: "",
        confirm: "",
        isEqualPass: true,
        isValidateEmail: true,
        isValidateName: true
    },
    methods: {
        validation(bool) {
            return bool ? "is-success" : "is-danger"
        }
    },
    computed: {
        passwordCheck() {
            this.isEqualPass = this.passwd === this.confirm

            if (this.passwd !== "") {
                return this.isEqualPass ? "is-success" : "is-danger"
            }
        },
        emailCheck() {
            const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            this.isValidateEmail = regex.test(this.email)

            if (this.email !== "") {
                return this.isValidateEmail ? "is-success" : "is-danger"
            }
        },
        nameCheck() {
            const regex = /\D/g
            this.isValidateName = regex.test(this.name)

            if (this.name !== "") {
                return this.isValidateName ? "is-success" : "is-danger"
            }
        }
    }
})

export default { pageSingleCustomer, pageAuth }