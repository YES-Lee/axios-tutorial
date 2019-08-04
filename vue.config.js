/**
 * @author Johnson
 * @email yeslee1126@gmail.com
 * @date Sunday, 4th August 2019 12:45:59 pm
 * @last Modified by Johnson
 */
const isProd = process.env.NODE_ENV === 'production'
module.exports = {
  publicPath: isProd ? '/axios-tutorial' : '/',
  outputDir: 'docs'
}
