
var config = require('../../../config')[process.env.NODE_ENV || 'development'];

exports.mailtemp = function(data){


return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, maximum-scale=1">
<title>Arthacoin</title>
</head>

<body>
<div style="font-family: Helvetica Neue, Helvetica, Helvetica, Arial, sans-serif;">
  <table style="width: 100%;">
    <tr>
      <td bgcolor="#FFFFFF "><div style="padding: 15px; max-width: 600px;margin: 0 auto;display: block; border-radius: 0px;padding: 0px; border: 1px solid #ddd;">
          <table style="width: 100%;background: #fff ; border-bottom: 1px solid #ddd;">
            <tr>
              <td><div>
                  <table width="100%">
                    <tr>
                      <td rowspan="2" style="text-align:center; padding:10px; background:#c8f1ff;"><img style="margin:auto; display:block; width:100px;" src="http://arthacoin.com/assets/images/arthalogo.png" ></td>
                    </tr>
                  </table>
                </div></td>
            </tr>
          </table>
          <!-- ===================== End Header ======================== -->
          <table style="padding: 10px;font-size:14px; width:100%;">
            <tr>
              <td style="padding:10px;font-size:14px; width:100%;">
                <p style="font-weight:600;">Dear ArthaCoin participant,</p>
                <br>
                <p  style="width:100%; float:left; margin-bottom:0;font-size: 20px; color:#3a5fd7; text-decoration:none; margin-top: 0;margin-bottom: 15px; "><b>Congratulations on joining the ArthaCoin blockchain community!</b></p>
                <br>

                   <p> <b>Please verify your account by clicking the link:

                   <a href="${data.url}">${data.url}</a></b></p>

                   <p><b>Upon the start of the Token Sale Event, on 11th March 2018 12 am CST, you can purchase ArthaCoins by contributing ETH into your personal Ethereum address shown on the dashboard.<b></p>
                   <p><b>
                   Be sure to do so at your earliest convenience, as we will close the token sale event upon reaching our hard cap, which may happen sooner than the official Token Sale end date of 12th April 2018.</p></b>
                   <p><b>Should you have any questions, do not hesitate to reach us at: support@arthacoin.com</b></p>
                   <p><b>We are excited to have you join our mission in revolutionizing online alternative investments!</b></p>
                   <p><b>To find updated information regarding your ATH balance, please log-in to your account at <a href="http://arthacoin.com"> www.arthacoin.com. </a>You will receive your ATH in your account at the end of the contribution day (Every 24 hours the distribution of tokens will take place).</b></p>

                <p>Sincerely,<br>
                 <strong> ArthaCoin Team </strong> </p>
                 <h5 style="color: #3a5fd7;font-weight: bold;font-size: 13px;">
                   ***This is an auto generated mail and shouldn't be responded to.</h5>

                </td>
            </tr>
            <!-- ===================== footer ======================== -->
            <tr>
              <td><div align="center" style="font-size:12px; margin-top:20px; padding:5px; width:100%; background:#c8f1ff; color:#000;"> 2018 © All Rights Reserved. <a href="http://arthacoin.com" target="_blank" style="color:#000;"> Arthacoin</a> </div></td>
            </tr>
            <!-- ===================== End_footer ======================== -->
          </table>
        </div></td>
    </tr>
  </table>
</div>
</body>
</html>

`


}
