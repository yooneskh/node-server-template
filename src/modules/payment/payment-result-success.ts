export const createSuccessResultPage = (title: string, heading: string, reason: string, callback: string) => `<!DOCTYPE html>
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
      border-top: 4px solid #26de81;
      width: 85%;
      max-width: 512px;
    }
    h1, h2, p { margin: 0; }
    h1 {
      margin: 16px 16px 16px 8px;
    }
    h2 {
      margin: 8px 16px 16px;
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
  </style>
</head>
<body>
  <div id="card">
    <h1>${heading}</h1>
    <div class="caption">جهت</div>
    <h2>${reason}</h2>
    <p>با موفقیت پرداخت شد.</p>
    <a href="${callback}">مشاهده</a>
  </div>
</body>
</html>`;
