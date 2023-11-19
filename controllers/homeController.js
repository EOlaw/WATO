
const homeRoutes = {
    renderHome: (req, res) => {
        res.render('home/homepage')
    },
    services: (req, res) => {
        res.render('home/services')
    },
    about: (req, res) => {
        res.render('home/about')
    },
    contact: (req, res) => {
        res.render('home/contact')
    },
    comingSoon: (req, res) => {
        res.render('home/coming-soon')
    }
}

module.exports = homeRoutes