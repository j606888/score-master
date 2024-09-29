## LINE Developer Console

https://developers.line.biz/console/provider/1635530416

## HOST

preview
https://score-master.vercel.app/

production
https://www.score-master.j606888.com/

## Deployment

Deployed on Vercel

https://vercel.com/j606888s-projects/score-master

`qa` branch for `preview` environment

`main` branch for `production` environment

## ENV

both file can be added to Vercel as `Environment Variables`

`./env.local`
LINE_ACCESS_TOKEN=
NEXT_PUBLIC_LINE_LIFF_ID=

`./env`
DATABASE_URL=

## DATABASE

When first time running with local database, run the following command to create tables

`npx prisma migrate deploy`