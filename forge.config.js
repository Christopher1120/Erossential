module.exports = {
    // ...
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'Christopher Carl Cruz',
                    name: 'Christopher1120'
                },
                prerelease: true
            }
        }
    ],
      packagerConfig: {
        icon: '/images/favico' // no file extension required
    }
};