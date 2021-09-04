
const pageSingleCustomer = new Vue({
    el: '#page-single',
    data: {
        name: "",
        switcher: false,
        avatar: false,
        avatarDefaultSrc: "https://bulma.io/images/placeholders/128x128.png",
        avatarSrc: "https://bulma.io/images/placeholders/128x128.png",
        tab: null,
        domain: "demo.com",
        domains: [],
        showSaveBtn: true,
        setDeleteState: false
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
        },
        toggleSwitcher() {
            this.switcher = !this.switcher
            if (this.domains.length > 0) {
                if (!this.switcher) {
                    this.domain = this.domains[0]
                }

                if (this.switcher) {
                    if (this.domain === this.domains[0]) {
                        this.domain = ""
                    }
                }
            }  else {
                if (this.switcher) {
                    this.domains[0] = this.domain
                    this.domain = ""
                }
            }
        },
        noSaveSwitcher(flag) {
            this.showSaveBtn = flag
        }
    },
    computed: {
        domainsJSON() {
            return JSON.stringify(this.domains)
        }
    },
    created() {
        const avatar = document.getElementById('avatar')
        const projects = document.getElementById('projects-hidden')
        const name = document.getElementById('name-hidden')

        if (avatar) {
            const src = document.getElementById('avatar').dataset.src

            if (src) {
                this.avatarSrc = src
                this.avatar = true
            }
        }

        if (projects) {
            const domains = JSON.parse(projects.value)

            if (domains.length === 1) {
                this.domain = domains[0]
            } else {
                this.domains = domains
                this.switcher = true
                this.domain = ""
            }
        }

        if (name) {
            this.name = name.value
        }
    }
})

const pageSingleTask = new Vue({
    el: '#page-single-task',
    data: {
        projects: [
            {domain: 'Проект', selected: true, disabled: true}
        ]
    },
    methods: {
        onChangeCustomer(e) {
            const {value} = e.target
            fetch('/customers/api/' + value + '?field=projects', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(data => this.projects = data.projects.map(p => ({ domain: p })))
        }
    },
    created() {
        console.log(this.projects)
        const currentProject = document.getElementById('project').value
        const projects = document.getElementById('projects').value.split(',')
        this.projects = projects
            .map(p => ({ domain: p }))
            .map(p => p.domain === currentProject ? {domain: p.domain, selected: true } : { domain: p.domain, selected: false } )
        console.log(this.projects)
    }
})

const pageAuth = new Vue({
    el: '#auth',
    data: {
        name: "",
        email: "",
        password: "",
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
            this.isEqualPass = this.password === this.confirm

            if (this.password !== "") {
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
    },
    created() {
        const inputs = document.querySelectorAll('[data-value]')
        inputs.forEach(item => {
            console.log(item)
            const name = item.getAttribute('name')
            const value = item.dataset.value

            if (name) {
                this[name] = value
            }
        })
    }
})

export default { pageSingleCustomer, pageAuth }