// livebeef@protonmail.com
// no rights reserved

const https = require('https');
const http = require('http');
const request = require('request');
const querystring = require('querystring');
const moment = require('moment');

function Bot() {
  Bot.prototype.main.sniff();
  Bot.prototype.main.get_lists().then(() => {
    try {
      setInterval(() => {
        let i,j;
        i = Math.floor(Math.random() * (Bot.prototype.main.usernames.length));
        j = Math.floor(Math.random() * (Bot.prototype.main.passwords.length));
        k = Math.floor(Math.random() * (Bot.prototype.main.hosts.length));
        try {
          Bot.prototype.main.request(Bot.prototype.main.usernames[i], Bot.prototype.main.passwords[j], Bot.prototype.main.hosts[k]);
        } catch(e) {
          console.log(e);
        }
        return;
      // ******
      // Set request interval in ms
      // ******
      }, 10000);
    } catch(e) {
      console.log(e);
    }
  });
};

Bot.prototype.main = {
  server: null,
  usernames: null,
  passwords: null,
  // *******
  // Add your hosts to stuff here
  // NB: some phishers host their forms on legitimate websites
  //     that have been hacked. Make sure you're not destroying
  //     some poor guy's bandwidth!
  // *******
  hosts: [
            ['PROTOCOL', 'DOMAIN', 'URI SLUG'],
            ['https', 'subdomain.domain.tld', '/fake/link.php'],
         ],
  get_lists: async function() {
    let x = this.get_user_list();
    await x;
    let y = this.get_pass_list();
    await y;
    return;
  },
  get_user_list: function() {
     return new Promise((resolve, reject) => {
        https.get('https://raw.githubusercontent.com/danielmiessler/SecLists/master/Usernames/Names/names.txt', (res) => {
        let data = '';
        res.on('data', (d) => {
         data += d;
        });
        res.on('end', () => {
          try {
            this.usernames = data.split('\n');
            resolve();
          } catch (e) {
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
        reject();
      });
    });
  },
  get_pass_list: function() {
   return new Promise((resolve, reject) => {
      https.get('https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10k-most-common.txt', (res) => {
        let data = '';
        res.on('data', (d) => {
         data += d;
        });
        res.on('end', () => {
          try {
            this.passwords = data.split('\r\n');
            resolve();
          } catch (e) {
            console.error(e.message);
            reject();
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
        reject();
      });
    });
  },
  sniff: function() {
    Bot.prototype.main.server = http.createServer();
    Bot.prototype.main.server.on('request', function(req, res) {
      console.log('Connection received');
      res.end();
      Bot.prototype.main.mail_request();
    });
    Bot.prototype.main.server.on('listening', (err) => {
      console.log('Listening...');
    });
    Bot.prototype.main.server.on('error', (err) => {
      console.error('BUG !');
    });
    Bot.prototype.main.server.listen(process.env.PORT || 8080, '0.0.0.0');
    return;
  },
  request: function(user_id, pass, host) {
    // *******
    // Fill in the form parameters here
    // *******
    const postData = querystring.stringify({
      'fill': 'in',
      'the_form': 'parameters_here',
      'user': user_id,
      'password': pass,
    });
    const options = {
      hostname: host[1],
      port: host[0] == 'https' ? 443 : 80,
      path: host[2],
      method: 'POST',
      headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
       'Content-Length': Buffer.byteLength(postData)
      }
    };
    if(host[0] == 'https') {
      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          if(res.statusCode == 404 || res.statusCode == '404') {
            reject(new Error('STATUS: 404'));
          }
          res.setEncoding('utf8');
          res.on('end', () => {
            resolve();
          });
        });
        req.on('error', (e) => {
          console.error(`problem with request: ${e.message}`);
          reject();
        });
        req.write(postData);
        req.end();
      });
    } else {
      return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          if(res.statusCode == 404 || res.statusCode == '404') {
            reject(new Error('STATUS: 404'));
          }
          res.setEncoding('utf8');
          res.on('end', () => {
            resolve();
          });
        });
        req.on('error', (e) => {
          console.error(`problem with request: ${e.message}`);
          reject();
        });
        req.write(postData);
        req.end();
      });
    }
  },
};

(function(){var p=new Bot()})();
