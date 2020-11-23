const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const { expect } = chai;
chai.use(chaiHttp);


describe('##SERVER Connection', function () {

    it('should connect to the base endpoint', function (done) {
        chai
            .request(app)
            .get('/')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });


    it('should return 404 error on invalid endpoint', function (done) {
        chai
            .request(app)
            .get('/xyz')
            .end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
    });

    // testing mocha
    it('should add the numbers', function (done) {
        expect(2 + 4).to.equal(6);
        done();
    });

});
