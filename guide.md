## first terminal
cd .\myapp\
npx expo start -c

## second terminal
cd .\myapp\backend\ 
node --env-file=.env index.js 

## third terminal (if needed)
### upload to remote repo
cd .\myapp\
git add .
git commit -m "some update, might break"
git push
### or other things
ipconfig
(any other nescesary things)