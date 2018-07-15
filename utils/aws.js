const uuidv1 = require('uuid/v1');
const AWS = require('aws-sdk');

var awsHost = process.env.awsHost;
var albumBucketName = process.env.albumBucketName;
var bucketRegion = process.env.bucketRegion;
var IdentityPoolId = process.env.IdentityPoolI;

module.exports = {
	s3ImageUpload: async function(file) {
		const uuid = uuidv1();
		const photoKey = 'uploads/'+uuid+'.jpeg';

		//TODO we want authenticated s3 uploads. commented out code not working & is still not authenticated
		//https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html
		// AWS.config.update({
		//   region: bucketRegion,
		//   credentials: new AWS.CognitoIdentityCredentials({
		//     IdentityPoolId: IdentityPoolId
		//   })
		// });

		// var s3 = new AWS.S3({
		//   apiVersion: '2006-03-01',
		//   params: {Bucket: albumBucketName}
		// });

		// s3.upload({
	 //    Key: photoKey,
	 //    Body: req.files[0].buffer,
	 //    ACL: 'public-read'
	 //  }, function(err, data) {
	 //    if (err) {
	 //      return alert('There was an error uploading your photo: ', err.message);
	 //    }
	 //    alert('Successfully uploaded photo.');
	 //  });

	  //https://www.nodejsera.com/storing-files-in-amazon-s3-using-node.html

	  
	  	var s3 = new AWS.S3();
		
		const params = {Bucket: albumBucketName, Key: photoKey, Body: file, ACL: 'public-read' };
	 	try {
			const upload_promise = await s3.putObject(params).promise();
	      		console.log("Successfully uploaded to s3 ");
	      		return awsHost+'/'+albumBucketName+'/'+photoKey;
	    	}
		catch(err) {
			console.log(err);
			throw err;
		}
	}
}
