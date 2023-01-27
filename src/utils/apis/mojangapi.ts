import * as https from 'https';

export class MojangApi {
    getUUUID(name: String, callback: Function) {
        const options = {
            hostname: 'api.mojang.com',
            port: 443,
            path: `/users/profiles/minecraft/${name}`
        };
        const req = https
            .get(options, res => {
                let json = '';
                res.on('data', chunk => {
                    json += chunk;
                });
                res.on('end', () => {
                    if(res.statusCode === 200) {
                        try {
							const data = JSON.parse(json);
							// data is available here:
							callback(data);
						} catch (e) {
							console.log('Error parsing JSON!');
						}
                    } else {
						console.log('Status (MjpApi):', res.statusCode);
					}
                })
            })
            .on('error', err => {
				console.log(`problem with request:${err.message}`);
            })
        req.end;
    }
}