import path from 'path';

export default {
    entry: './src/index.ts',
    target: 'node',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean:true
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        compilerOptions: {
                            "module": "es6"

                        }
                    }
                }],
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
};