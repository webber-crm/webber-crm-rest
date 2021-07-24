
const app = new Vue({
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
    }
})

export default { app }