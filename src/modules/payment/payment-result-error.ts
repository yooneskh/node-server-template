export const createErrorResultPage = (title: string, reason: string, callback: string, callbackSupport: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="https://www.markazeteb.ir/favicon.ico">
  <title>${title}</title>
  <style>
    body {
      background: #FAFAFA;
      text-align: center;
      direction: rtl;
    }
    #card {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 4px;
      display: inline-block;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-top: 4px solid #fc5c65;
      width: 85%;
      max-width: 512px;
    }
    p {
      margin: 16px 16px 0;
    }
    .reason {
      margin-top: 8px;
      font-family: monospace;
      direction: ltr;
    }
    a {
      background-color: transparent;
      text-decoration: none;
      color: #212121;
      margin: 24px 4px 4px;
      padding: 12px 0;
      border-radius: 4px;
      display: block;
      transition: all 300ms ease-in-out;
    }
    a:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    a + a { margin-top: 4px; }
  </style>
</head>
<body>
  <div id="card">
    <p>خطایی در پرداخت شما رخ داده است. در صورت کم شدن وجه از حساب شما، وجه واریزی حداکثر طی ۷۲ ساعت به شما بازگردانده خواهد شد. در غیر اینصورت لطفا با پشتیبانی تماس بگیرید.</p>
    <div class="reason">${reason}</div>
    <a href="${callbackSupport}">تماس با پشتیبانی</a>
    <a href="${callback}">بازگشت</a>
  </div>
</body>
</html>`;
