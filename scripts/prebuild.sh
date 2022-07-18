if [ -z "$REACT_APP_COMMIT_HASH" ];
then export REACT_APP_COMMIT_HASH=$(git rev-parse --short HEAD);
fi;

if [ -z "$REACT_APP_COMMIT_MESSAGE" ];
then export REACT_APP_COMMIT_MESSAGE="$(git log -1 --pretty=format:%s  $*)";
fi;

if [ -z "$REACT_APP_VERSION" ];
then export REACT_APP_VERSION="$(node -e 'console.log(require("./package.json").version)')";
fi;

if [ -z "$REACT_APP_REPO_URL" ];
then export REACT_APP_REPO_URL="$(git config --get remote.origin.url)";
fi;
