const CustomError = require("../../helpers/responses/CustomError");
const responseHandler = require("../../helpers/responses/successResponse");
const { Driver } = require('../../models/');
const sendMail = require("../../helpers/mailer");

exports.viewAllDrivers = async (req, res, next) => {
    //  admin can view  all drivers and toggle between viewing drivers that are not verified or 
    // application has not been viewed..
    const { page = 1, limit = 10, filter } = req.query;
    try {
        let drivers;
		let count;
		if (filter) {
			if (filter.toString() == "verified") {
                drivers = await Driver.find({ verified: true })
                    .sort({ createdAt: -1 })
					.limit(limit * 1)
					.skip((page - 1) * limit)
					.exec();
				count = await Driver.countDocuments({ verified: true });
			} else if (filter.toString() == "not-verified") {
				drivers = await Driver.find({ verified: false })
					.limit(limit * 1)
					.skip((page - 1) * limit)
					.exec();
				count = await Driver.countDocuments({ verified: false });
			} else if (filter.toString() == "not-checked") {
				drivers = await Driver.find({ verified: false, application_status: "not-checked" })
					.limit(limit * 1)
					.skip((page - 1) * limit)
					.exec();
                count = await Driver.countDocuments({ verified: false , application_status: "not-checked" });
            } else if (filter.toString() == "checked") {
				drivers = await Driver.find({ application_status: "checked" })
					.limit(limit * 1)
					.skip((page - 1) * limit)
					.exec();
                count = await Driver.countDocuments({ application_status: "checked" });
            }
		} else {
			drivers = await Driver.find()
				.limit(limit * 1)
				.skip((page - 1) * limit)
				.exec();
			count = await Driver.countDocuments();
		}

		if (count === 0) {
            next(new CustomError(404, "No driver found."));
            return;
		}
		return res.status(200).json({
			message: `${count} ${count > 1 ? `Drivers`: `Driver`} found`,
			count,
			data: drivers,
			totalPages: Math.ceil(count / limit),
			currentPage: page,
		});
    } catch (error) {
        console.log('Error from getting all drivers >>>> ', error);
        return next(error);
    }
};

exports.getDriver = async (req, res, next) => {
    const { driverId } = req.params;
    try {
        const driver = await Driver.findOne({ user_id: driverId });
        if (!driver) {
            next(new CustomError(404, "Driver not found or has been deleted"));
            return;
        }
        if (driver.application_status == "not-checked") {
            driver.application_status = "checked";
            await driver.save();
        }
        return responseHandler(res, 200, driver, "Driver details found");
    } catch (error) {
        console.log(`Error from getting a driver details >>> ${error}`);
		return next(error);
    }
};

exports.deleteDriver = async (req, res, next) => {
    const { driverId } = req.params;
    try {
        const deletedDriver = await Driver.findOneAndDelete({ user_id: driverId });
        if (!deletedDriver) {
            next(new CustomError(404, "Driver has already been deleted"));
            return;
        }
        return responseHandler(res, 200, deletedDriver, "Driver deleted successfully");
    } catch (error) {
        console.log(`Error from deleting a driver >>> ${error}`);
		return next(error);
    }
};

exports.editDriverRecord = async (req, res, next) => {
    const { driverId } = req.params;
    try {
        const updatedDriver = await Driver.findOneAndUpdate(
            { user_id: driverId }, 
            {
                $set: {
                    ...req.body,
                },
            }
        );
        
        if (!updatedDriver) {
            const errorMsg = "Could not update driver. Driver does not exist or has been deleted";
            next(new CustomError(404, errorMsg));
            return;
        }
        return responseHandler(res, 200, updatedDriver, "Driver updated successfully");
    } catch (error) {
        console.log(`Error from updating a driver info >>> ${error}`);
		return next(error);
    }
};

exports.approveDriver = async (req, res, next) => {
    const { driverId } = req.params;
    try {
        const driver = await Driver.findOne({ user_id: driverId });
        if (!driver) {
            next(new CustomError(404, "Driver does not exist"));
            return;
        }
        if (driver.verified) {
            next(new CustomError(409, "Driver has already been verified and approved"));
            return;
        }
        const updatedDriver = await Driver.findOneAndUpdate(
            { user_id: driverId },
            { 
                $set: {
                    verified: true, application_status: "checked",
                },
            },
            { new: true }
        );
        
        if (!updatedDriver) {
            const errorMsg = "Could not update driver. Driver does not exist or has been deleted";
            next(new CustomError(404, errorMsg));
            return;
        }
        if (process.env.NODE_ENV !== 'test') {
            const { last_name, first_name, email } = updatedDriver;
            const content = `<h2 style="display: flex; align-items: center;">Upbase Foods</h2>
                <p>Hello ${first_name} ${last_name}, <br> we are happy to inform you that your application as a
                Rider at Upbase Foods has been reviewed and approved .</p>
                <p>You may proceed to login. </p><br>
                <br><br>
                <h5>Best Regards, <b><span style="color: red;">Upbase Foods</span></b> Team.</h5>
            `;
            await sendMail(
                email, 
                'Upbase Foods Driver Approval',
                content
            );
        }
        return responseHandler(res, 200, updatedDriver, "Driver verified successfully");
    } catch (error) {
        console.log(`Error from approving a driver registration >>> ${error}`);
		return next(error);
    }
};
