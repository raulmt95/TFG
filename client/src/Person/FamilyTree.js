import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TreeErrorBoundary from './TreeErrorBoundary';
import ReactFamilyTree from 'react-family-tree';
import FamilyNode from './FamilyNode';

const WIDTH = 300;
const HEIGHT = 120;

const useStyles = makeStyles((theme) => ({
  wrapper: {
    zIndex: 0,
    width: 'calc(100% - 280px)',
    height: '87.5%',
    position: 'fixed',
    right: 0,
    overflow: 'scroll',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1%',
  },
}));

export default function FamilyTree(props) {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
        <TreeErrorBoundary showNotification = {props.showNotification}>
            <ReactFamilyTree
                nodes = {props.nodeList}
                rootId = {props.rootNodeID}
                width = {WIDTH}
                height = {HEIGHT}
                renderNode = {(node) => {
                  return (
                      <FamilyNode
                          key = {node.id}
                          node = {node}
                          person = {props.personList.find(p => p.getID() === node.id)}
                          changeSubtree = {props.changeSubtree}
                          selected = {props.selectedPerson === props.personList.find(p => p.getID() === node.id)}
                          setSelected = {props.setSelected}
                          currentUser = {props.currentUser}
                          reRender = {props.reRenderTree}
                          resultList = {props.resultList}
                          style = {{
                              width: WIDTH,
                              height: HEIGHT,
                              transform: `translate(${node.left * (WIDTH / 2)}px, ${node.top * (HEIGHT / 2)}px)`,
                          }}
                      />
                  );
                }
            }
            />
        </TreeErrorBoundary>
    </div>
  );
}