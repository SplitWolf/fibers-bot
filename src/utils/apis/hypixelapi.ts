import * as https from 'https';

export class HypixelApi {
    getUser(uuid: string, callback: Function) {
        const options = {
			hostname: 'api.hypixel.net',
			port: 443,
			path: `/player?key=e3f3926b-4134-4876-8966-ba8a9aa00572&uuid=${uuid}`
		};
		const req = https
			.get(options, res => {
				let json = '';
				res.on('data', chunk => {
					json += chunk;
				});
				res.on('end', () => {
					if (res.statusCode === 200) {
						try {
							const data = JSON.parse(json);
							// data is available here:
							callback(data);
						} catch (e) {
							console.log(e);
							console.log('Error parsing JSON!');
						}
					} else {
						console.log('Status (MjApi):', res.statusCode);
					}
				});
			})
			.on('error', err => {
				console.log(`problem with request:${err.message}`);
			});

		req.end;
    }
}