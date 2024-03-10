if [ -z "$VITE__COMMIT_HASH" ];
then export VITE__COMMIT_HASH=$(git rev-parse --short HEAD);
fi;

if [ -z "$VITE__COMMIT_MESSAGE" ];
then export VITE__COMMIT_MESSAGE="$(git log -1 --pretty=format:%s  $*)";
fi;

if [ -z "$VITE__VERSION" ];
then export VITE__VERSION="$(node -e 'console.log(require("./package.json").version)')";
fi;

if [ -z "$VITE__REPO_URL" ];
then export VITE__REPO_URL="$(git config --get remote.origin.url)";
fi;
