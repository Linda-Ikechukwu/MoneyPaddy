if(process.env.NODE_ENV === 'production') {
    module.exports = {
        plugins: {
            'postcss-import':{},
            'autoprefixer': {},
            'cssnano':{},

            // More postCSS modules here if needed
        }
    }
}