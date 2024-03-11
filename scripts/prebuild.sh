if [ -z "$VITE_COMMIT_HASH" ];
then export VITE_COMMIT_HASH=$(git rev-parse --short HEAD);
fi;

if [ -z "$VITE_COMMIT_MESSAGE" ];
then export VITE_COMMIT_MESSAGE="$(git log -1 --pretty=format:%s  $*)";
fi;

if [ -z "$VITE_VERSION" ];
then export VITE_VERSION="$(node -e 'console.log(require("./package.json").version)')";
fi;

if [ -z "$VITE_REPO_URL" ];
then export VITE_REPO_URL="$(git config --get remote.origin.url)";
fi;
